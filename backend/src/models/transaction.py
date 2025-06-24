from .user import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    icon = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'icon': self.icon
        }

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
    if Category.query.count() == 0:
        default_categories = [
            {'name': 'Food & Dining', 'type': 'expense', 'icon': '🍽️'},
            {'name': 'Transportation', 'type': 'expense', 'icon': '🚗'},
            {'name': 'Shopping', 'type': 'expense', 'icon': '🛍️'},
            {'name': 'Entertainment', 'type': 'expense', 'icon': '🎬'},
            {'name': 'Bills & Utilities', 'type': 'expense', 'icon': '📄'},
            {'name': 'Healthcare', 'type': 'expense', 'icon': '🏥'},
            {'name': 'Education', 'type': 'expense', 'icon': '📚'},
            {'name': 'Travel', 'type': 'expense', 'icon': '✈️'},
            {'name': 'Groceries', 'type': 'expense', 'icon': '🛒'},
            {'name': 'Housing', 'type': 'expense', 'icon': '🏠'},
            {'name': 'Salary', 'type': 'income', 'icon': '💰'},
            {'name': 'Freelance', 'type': 'income', 'icon': '💼'},
            {'name': 'Investment', 'type': 'income', 'icon': '📈'},
            {'name': 'Gift', 'type': 'income', 'icon': '🎁'},
            {'name': 'Other Income', 'type': 'income', 'icon': '💵'},
            {'name': 'Other Expense', 'type': 'expense', 'icon': '💸'}
        ]
        
        for category_data in default_categories:
            category = Category(**category_data)
            db.session.add(category)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error initializing default categories: {e}")