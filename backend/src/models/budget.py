from .user import db
from datetime import datetime

class BudgetCategory(db.Model):
    __tablename__ = 'budget_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    budget_category_id = db.Column(db.Integer, db.ForeignKey('budget_categories.id'))
    amount = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(20), default='monthly')
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FinancialGoal(db.Model):
    __tablename__ = 'financial_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GoalContribution(db.Model):
    __tablename__ = 'goal_contributions'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('financial_goals.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    contribution_date = db.Column(db.DateTime, default=datetime.utcnow)