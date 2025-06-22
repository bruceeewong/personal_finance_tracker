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
    """Initialize default account types if they don't exist"""
    default_types = [
        {'name': 'Checking', 'description': 'Primary checking account for daily expenses'},
        {'name': 'Savings', 'description': 'Savings account for storing money'},
        {'name': 'Credit Card', 'description': 'Credit card account for credit transactions'},
        {'name': 'Investment', 'description': 'Investment account for stocks, bonds, etc.'},
        {'name': 'Retirement', 'description': '401k, IRA, and other retirement accounts'},
        {'name': 'Cash', 'description': 'Cash on hand or petty cash'},
        {'name': 'Loan', 'description': 'Personal loans, mortgages, auto loans'},
        {'name': 'Crypto', 'description': 'Cryptocurrency wallets and exchanges'},
    ]
    
    for account_type_data in default_types:
        existing = AccountType.query.filter_by(name=account_type_data['name']).first()
        if not existing:
            account_type = AccountType(
                name=account_type_data['name'],
                description=account_type_data['description']
            )
            db.session.add(account_type)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing account types: {e}")