from .user import db
from datetime import datetime

class InvestmentType(db.Model):
    __tablename__ = 'investment_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Investment(db.Model):
    __tablename__ = 'investments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    investment_type_id = db.Column(db.Integer, db.ForeignKey('investment_types.id'))
    name = db.Column(db.String(100), nullable=False)
    symbol = db.Column(db.String(20))
    quantity = db.Column(db.Float, default=0.0)
    purchase_price = db.Column(db.Float)
    current_price = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class InvestmentTransaction(db.Model):
    __tablename__ = 'investment_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)

class PriceHistory(db.Model):
    __tablename__ = 'price_history'
    
    id = db.Column(db.Integer, primary_key=True)
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

class Dividend(db.Model):
    __tablename__ = 'dividends'
    
    id = db.Column(db.Integer, primary_key=True)
    investment_id = db.Column(db.Integer, db.ForeignKey('investments.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

def init_investment_types():
    pass