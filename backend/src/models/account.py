from .user import db
from datetime import datetime

class AccountType(db.Model):
    __tablename__ = 'account_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    account_type_id = db.Column(db.Integer, db.ForeignKey('account_types.id'))
    balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CryptoAccount(db.Model):
    __tablename__ = 'crypto_accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    wallet_address = db.Column(db.String(200))

class AccountBalanceHistory(db.Model):
    __tablename__ = 'account_balance_history'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_account_types():
    pass