from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import re

from src.models.user import db, User, UserRelationship, UserSession
from src.utils.logger import log_auth_event, log_jwt_operation, log_db_operation, auth_logger

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=data.get('phone'),
            timezone=data.get('timezone', 'UTC'),
            currency_preference=data.get('currency_preference', 'USD')
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Create access and refresh tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            token_hash=access_token[:50],  # Store partial hash for identification
            refresh_token_hash=refresh_token[:50],
            expires_at=datetime.utcnow() + timedelta(hours=1),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        auth_logger.info(f"🔐 Login attempt started")
        
        email = str(data.get("email", "")).lower().strip()
        password = str(data.get("password", ""))
        
        if not email or not password:
            log_auth_event('LOGIN', user_email=email, success=False, details="Missing email or password")
            return jsonify({'error': 'Email and password are required'}), 400
        
        auth_logger.info(f"🔍 Looking up user: {email}")
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            log_auth_event('LOGIN', user_email=email, success=False, details="User not found")
            return jsonify({'error': 'Invalid email or password'}), 401
            
        if not user.check_password(password):
            log_auth_event('LOGIN', user_email=email, user_id=user.id, success=False, details="Invalid password")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            log_auth_event('LOGIN', user_email=email, user_id=user.id, success=False, details="Account deactivated")
            return jsonify({'error': 'Account is deactivated'}), 401
        
        auth_logger.info(f"✅ User authenticated: {email} (ID: {user.id})")
        
        # Update last login
        user.last_login = datetime.utcnow()
        
        # Create access and refresh tokens
        auth_logger.info(f"🔑 Creating tokens for user {user.id}")
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        log_jwt_operation('CREATED', user_id=user.id, token_type='access', details=f"Token: {access_token[:20]}...")
        log_jwt_operation('CREATED', user_id=user.id, token_type='refresh')
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            token_hash=access_token[:50],
            refresh_token_hash=refresh_token[:50],
            expires_at=datetime.utcnow() + timedelta(hours=1),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')
        )
        db.session.add(session)
        db.session.commit()
        
        log_auth_event('LOGIN', user_email=email, user_id=user.id, success=True, details="Login successful")
        log_db_operation('CREATE', 'UserSession', session.id, f"User {user.id} login session")
        
        auth_logger.info(f"🎉 Login completed successfully for user {user.id}")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(include_sensitive=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        db.session.rollback()
        auth_logger.error(f"💥 Login failed with exception: {str(e)}", exc_info=True)
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Create new access token
        access_token = create_access_token(identity=str(user.id))
        
        # Update session
        session = UserSession.query.filter_by(
            user_id=user.id,
            is_active=True
        ).order_by(UserSession.created_at.desc()).first()
        
        if session:
            session.token_hash = access_token[:50]
            session.expires_at = datetime.utcnow() + timedelta(hours=1)
            session.last_used = datetime.utcnow()
            db.session.commit()
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    try:
        current_user_id = get_jwt_identity()
        jti = get_jwt()['jti']
        
        # Deactivate user sessions
        sessions = UserSession.query.filter_by(user_id=current_user_id, is_active=True).all()
        for session in sessions:
            session.is_active = False
        
        db.session.commit()
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        auth_logger.info("🔍 /me endpoint called - JWT validation passed")
        
        current_user_id = get_jwt_identity()
        auth_logger.info(f"🆔 Extracted user ID from JWT: {current_user_id}")
        
        if not current_user_id:
            auth_logger.error("❌ No user ID found in JWT token")
            return jsonify({'error': 'Invalid token - no user ID'}), 401
        
        # Convert string ID back to integer
        try:
            user_id = int(current_user_id)
        except (ValueError, TypeError):
            auth_logger.error(f"❌ Invalid user ID format: {current_user_id}")
            return jsonify({'error': 'Invalid token - bad user ID format'}), 401
        
        auth_logger.info(f"🔍 Looking up user in database: ID {user_id}")
        user = User.query.get(user_id)
        
        if not user:
            auth_logger.error(f"❌ User {current_user_id} not found in database")
            log_auth_event('ME_REQUEST', user_id=current_user_id, success=False, details="User not found in database")
            return jsonify({'error': 'User not found'}), 404
        
        auth_logger.info(f"✅ User found: {user.email} (ID: {user.id}, Active: {user.is_active})")
        log_auth_event('ME_REQUEST', user_email=user.email, user_id=user.id, success=True)
        
        return jsonify({
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        auth_logger.error(f"💥 /me endpoint failed: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to get user information', 'details': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        
        # Deactivate all existing sessions
        sessions = UserSession.query.filter_by(user_id=user.id, is_active=True).all()
        for session in sessions:
            session.is_active = False
        
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'details': str(e)}), 500

@auth_bp.route('/invite-partner', methods=['POST'])
@jwt_required()
def invite_partner():
    """Invite a partner to share financial data"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        partner_email = data.get('partner_email', '').lower().strip()
        
        if not partner_email:
            return jsonify({'error': 'Partner email is required'}), 400
        
        # Find partner by email
        partner = User.query.filter_by(email=partner_email).first()
        if not partner:
            return jsonify({'error': 'User with this email not found'}), 404
        
        if partner.id == current_user_id:
            return jsonify({'error': 'Cannot invite yourself'}), 400
        
        # Check if relationship already exists
        existing = UserRelationship.query.filter(
            ((UserRelationship.user_id == current_user_id) & (UserRelationship.partner_id == partner.id)) |
            ((UserRelationship.user_id == partner.id) & (UserRelationship.partner_id == current_user_id))
        ).first()
        
        if existing:
            return jsonify({'error': 'Relationship already exists'}), 409
        
        # Create relationship invitation
        relationship = UserRelationship(
            user_id=current_user_id,
            partner_id=partner.id,
            status='pending'
        )
        relationship.set_permissions({
            'view_accounts': True,
            'view_transactions': True,
            'add_transactions': True,
            'view_investments': True,
            'view_budgets': True
        })
        
        db.session.add(relationship)
        db.session.commit()
        
        return jsonify({
            'message': 'Partner invitation sent successfully',
            'relationship': relationship.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send invitation', 'details': str(e)}), 500

@auth_bp.route('/accept-invitation/<int:relationship_id>', methods=['POST'])
@jwt_required()
def accept_invitation(relationship_id):
    """Accept a partner invitation"""
    try:
        current_user_id = get_jwt_identity()
        
        relationship = UserRelationship.query.filter_by(
            id=relationship_id,
            partner_id=current_user_id,
            status='pending'
        ).first()
        
        if not relationship:
            return jsonify({'error': 'Invitation not found'}), 404
        
        relationship.status = 'accepted'
        relationship.accepted_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invitation accepted successfully',
            'relationship': relationship.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to accept invitation', 'details': str(e)}), 500

@auth_bp.route('/pending-invitations', methods=['GET'])
@jwt_required()
def get_pending_invitations():
    """Get pending partner invitations"""
    try:
        current_user_id = get_jwt_identity()
        
        invitations = UserRelationship.query.filter_by(
            partner_id=current_user_id,
            status='pending'
        ).all()
        
        return jsonify({
            'invitations': [inv.to_dict() for inv in invitations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get invitations', 'details': str(e)}), 500

