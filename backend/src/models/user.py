from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    timezone = db.Column(db.String(50), default='UTC')
    currency_preference = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'timezone': self.timezone,
            'currency_preference': self.currency_preference,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_sensitive:
            data['last_login'] = self.last_login.isoformat() if self.last_login else None
        return data

class UserRelationship(db.Model):
    __tablename__ = 'user_relationships'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    partner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    permissions = db.Column(db.Text)
    accepted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_permissions(self, permissions_dict):
        self.permissions = json.dumps(permissions_dict)
    
    def get_permissions(self):
        return json.loads(self.permissions) if self.permissions else {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'partner_id': self.partner_id,
            'status': self.status,
            'permissions': self.get_permissions(),
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token_hash = db.Column(db.String(100))
    refresh_token_hash = db.Column(db.String(100))
    expires_at = db.Column(db.DateTime)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    last_used = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)