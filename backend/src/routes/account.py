from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.account import Account, AccountType, AccountBalanceHistory, db
from ..utils.logger import app_logger

account_bp = Blueprint('account', __name__)
logger = app_logger

@account_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    try:
        user_id = get_jwt_identity()
        logger.info(f"Getting accounts for user {user_id}")
        
        accounts = Account.query.filter_by(user_id=int(user_id), is_active=True).all()
        
        account_data = []
        for account in accounts:
            account_data.append({
                'id': account.id,
                'name': account.name,
                'account_type_id': account.account_type_id,
                'balance': account.balance,
                'currency': account.currency,
                'is_active': account.is_active,
                'created_at': account.created_at.isoformat() if account.created_at else None
            })
        
        logger.info(f"Found {len(account_data)} accounts for user {user_id}")
        return jsonify({
            'message': 'Accounts retrieved successfully',
            'accounts': account_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving accounts for user {user_id}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve accounts'}), 500

@account_bp.route('/accounts', methods=['POST'])
@jwt_required()
def create_account():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'account_type_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate account type exists
        account_type = AccountType.query.get(data['account_type_id'])
        if not account_type:
            return jsonify({'error': 'Invalid account type'}), 400
        
        # Create new account
        account = Account(
            user_id=int(user_id),
            name=data['name'].strip(),
            account_type_id=data['account_type_id'],
            balance=float(data.get('balance', 0.0)),
            currency=data.get('currency', 'USD').upper()
        )
        
        db.session.add(account)
        db.session.commit()
        
        # Create initial balance history record
        balance_history = AccountBalanceHistory(
            account_id=account.id,
            balance=account.balance
        )
        db.session.add(balance_history)
        db.session.commit()
        
        logger.info(f"Created account {account.id} for user {user_id}")
        
        return jsonify({
            'message': 'Account created successfully',
            'account': {
                'id': account.id,
                'name': account.name,
                'account_type_id': account.account_type_id,
                'balance': account.balance,
                'currency': account.currency,
                'is_active': account.is_active,
                'created_at': account.created_at.isoformat()
            }
        }), 201
        
    except ValueError as e:
        logger.error(f"Validation error creating account: {str(e)}")
        return jsonify({'error': 'Invalid data format'}), 400
    except Exception as e:
        logger.error(f"Error creating account for user {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create account'}), 500

@account_bp.route('/accounts/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    try:
        user_id = get_jwt_identity()
        
        account = Account.query.filter_by(
            id=account_id, 
            user_id=int(user_id), 
            is_active=True
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        return jsonify({
            'message': 'Account retrieved successfully',
            'account': {
                'id': account.id,
                'name': account.name,
                'account_type_id': account.account_type_id,
                'balance': account.balance,
                'currency': account.currency,
                'is_active': account.is_active,
                'created_at': account.created_at.isoformat() if account.created_at else None
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving account {account_id} for user {user_id}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve account'}), 500

@account_bp.route('/accounts/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        account = Account.query.filter_by(
            id=account_id, 
            user_id=int(user_id), 
            is_active=True
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Track balance changes for history
        old_balance = account.balance
        
        # Update allowed fields
        if 'name' in data:
            account.name = data['name'].strip()
        if 'balance' in data:
            account.balance = float(data['balance'])
        if 'currency' in data:
            account.currency = data['currency'].upper()
        if 'account_type_id' in data:
            # Validate account type exists
            account_type = AccountType.query.get(data['account_type_id'])
            if not account_type:
                return jsonify({'error': 'Invalid account type'}), 400
            account.account_type_id = data['account_type_id']
        
        db.session.commit()
        
        # Record balance change if balance was updated
        if 'balance' in data and old_balance != account.balance:
            balance_history = AccountBalanceHistory(
                account_id=account.id,
                balance=account.balance
            )
            db.session.add(balance_history)
            db.session.commit()
            logger.info(f"Balance updated for account {account_id}: {old_balance} -> {account.balance}")
        
        logger.info(f"Updated account {account_id} for user {user_id}")
        
        return jsonify({
            'message': 'Account updated successfully',
            'account': {
                'id': account.id,
                'name': account.name,
                'account_type_id': account.account_type_id,
                'balance': account.balance,
                'currency': account.currency,
                'is_active': account.is_active,
                'created_at': account.created_at.isoformat() if account.created_at else None
            }
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error updating account {account_id}: {str(e)}")
        return jsonify({'error': 'Invalid data format'}), 400
    except Exception as e:
        logger.error(f"Error updating account {account_id} for user {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update account'}), 500

@account_bp.route('/accounts/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    try:
        user_id = get_jwt_identity()
        
        account = Account.query.filter_by(
            id=account_id, 
            user_id=int(user_id), 
            is_active=True
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Soft delete - just mark as inactive
        account.is_active = False
        db.session.commit()
        
        logger.info(f"Deleted (deactivated) account {account_id} for user {user_id}")
        
        return jsonify({
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting account {account_id} for user {user_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account'}), 500

@account_bp.route('/account-types', methods=['GET'])
@jwt_required()
def get_account_types():
    try:
        account_types = AccountType.query.all()
        
        types_data = []
        for account_type in account_types:
            types_data.append({
                'id': account_type.id,
                'name': account_type.name,
                'description': account_type.description
            })
        
        return jsonify({
            'message': 'Account types retrieved successfully',
            'account_types': types_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving account types: {str(e)}")
        return jsonify({'error': 'Failed to retrieve account types'}), 500

@account_bp.route('/accounts/<int:account_id>/balance-history', methods=['GET'])
@jwt_required()
def get_account_balance_history(account_id):
    try:
        user_id = get_jwt_identity()
        
        # Verify account ownership
        account = Account.query.filter_by(
            id=account_id, 
            user_id=int(user_id)
        ).first()
        
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Get balance history
        history = AccountBalanceHistory.query.filter_by(
            account_id=account_id
        ).order_by(AccountBalanceHistory.recorded_at.desc()).limit(100).all()
        
        history_data = []
        for record in history:
            history_data.append({
                'id': record.id,
                'balance': record.balance,
                'recorded_at': record.recorded_at.isoformat() if record.recorded_at else None
            })
        
        return jsonify({
            'message': 'Balance history retrieved successfully',
            'balance_history': history_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving balance history for account {account_id}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve balance history'}), 500