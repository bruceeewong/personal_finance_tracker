from .user import db
from .transaction import Category
from datetime import datetime

class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'monthly' or 'goal'
    amount = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # 'active', 'inactive', 'completed'
    rollover_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='budgets')
    categories = db.relationship('BudgetCategory', back_populates='budget', cascade='all, delete-orphan')
    goals = db.relationship('BudgetGoal', back_populates='budget', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'type': self.type,
            'amount': float(self.amount),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'rollover_enabled': self.rollover_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class BudgetCategory(db.Model):
    __tablename__ = 'budget_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('budgets.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    allocated_amount = db.Column(db.Float, nullable=False)
    alert_threshold_50 = db.Column(db.Boolean, default=True)
    alert_threshold_75 = db.Column(db.Boolean, default=True)
    alert_threshold_90 = db.Column(db.Boolean, default=True)
    alert_threshold_100 = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    budget = db.relationship('Budget', back_populates='categories')
    category = db.relationship('Category', backref='budget_allocations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'budget_id': self.budget_id,
            'category_id': self.category_id,
            'allocated_amount': float(self.allocated_amount),
            'alert_threshold_50': self.alert_threshold_50,
            'alert_threshold_75': self.alert_threshold_75,
            'alert_threshold_90': self.alert_threshold_90,
            'alert_threshold_100': self.alert_threshold_100,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'category': self.category.to_dict() if self.category else None
        }

class BudgetGoal(db.Model):
    __tablename__ = 'budget_goals'
    
    id = db.Column(db.Integer, primary_key=True)
    budget_id = db.Column(db.Integer, db.ForeignKey('budgets.id'), nullable=False)
    goal_name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.Date, nullable=False)
    auto_contribute_amount = db.Column(db.Float)
    auto_contribute_frequency = db.Column(db.String(20))  # 'weekly', 'monthly', 'biweekly'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    budget = db.relationship('Budget', back_populates='goals')
    
    def to_dict(self):
        return {
            'id': self.id,
            'budget_id': self.budget_id,
            'goal_name': self.goal_name,
            'target_amount': float(self.target_amount),
            'current_amount': float(self.current_amount),
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'auto_contribute_amount': float(self.auto_contribute_amount) if self.auto_contribute_amount else None,
            'auto_contribute_frequency': self.auto_contribute_frequency,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'progress_percentage': round((self.current_amount / self.target_amount * 100), 2) if self.target_amount > 0 else 0
        }

# Keep the existing FinancialGoal and GoalContribution models for backward compatibility
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