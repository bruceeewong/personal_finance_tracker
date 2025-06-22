from .user import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    icon = db.Column(db.String(50))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TransactionSplit(db.Model):
    __tablename__ = 'transaction_splits'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

class Transfer(db.Model):
    __tablename__ = 'transfers'
    
    id = db.Column(db.Integer, primary_key=True)
    from_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    to_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transfer_date = db.Column(db.DateTime, default=datetime.utcnow)

def init_default_categories():
    pass