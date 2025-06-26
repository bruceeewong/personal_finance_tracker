from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from sqlalchemy import and_, extract, func
from sqlalchemy.orm import joinedload

from ..models.user import db
from ..models.budget import Budget, BudgetCategory, BudgetGoal
from ..models.transaction import Transaction, Category
from ..utils.logger import api_logger as logger

budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    """Get all budgets for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        budget_type = request.args.get('type')  # 'monthly' or 'goal'
        status = request.args.get('status', 'active')  # 'active', 'inactive', 'completed'
        
        # Build query
        query = Budget.query.filter_by(user_id=user_id)
        
        if budget_type:
            query = query.filter_by(type=budget_type)
        if status:
            query = query.filter_by(status=status)
            
        budgets = query.order_by(Budget.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'budgets': [budget.to_dict() for budget in budgets]
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching budgets: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch budgets'
        }), 500

@budget_bp.route('/budgets/current', methods=['GET'])
@jwt_required()
def get_current_budget():
    """Get the current month's active budget"""
    try:
        user_id = get_jwt_identity()
        current_date = date.today()
        
        # Find active monthly budget for current month
        budget = Budget.query.filter(
            and_(
                Budget.user_id == user_id,
                Budget.type == 'monthly',
                Budget.status == 'active',
                Budget.start_date <= current_date,
                (Budget.end_date >= current_date) | (Budget.end_date == None)
            )
        ).first()
        
        if not budget:
            return jsonify({
                'success': True,
                'budget': None,
                'message': 'No active budget for current month'
            }), 200
            
        # Load categories with spending
        budget_data = budget.to_dict()
        budget_data['categories'] = []
        
        for bc in budget.categories:
            category_data = bc.to_dict()
            
            # Calculate spent amount for this category
            spent = db.session.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category_id == bc.category_id,
                    extract('year', Transaction.transaction_date) == current_date.year,
                    extract('month', Transaction.transaction_date) == current_date.month
                )
            ).scalar() or 0
            
            # Convert positive expenses to negative for calculation
            if category_data['category'] and category_data['category']['type'] == 'expense':
                spent = abs(spent)
                
            category_data['spent_amount'] = float(spent)
            category_data['remaining_amount'] = float(bc.allocated_amount - spent)
            category_data['percentage_used'] = round((spent / bc.allocated_amount * 100), 2) if bc.allocated_amount > 0 else 0
            
            budget_data['categories'].append(category_data)
            
        return jsonify({
            'success': True,
            'budget': budget_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching current budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch current budget'
        }), 500

@budget_bp.route('/budgets/<int:budget_id>', methods=['GET'])
@jwt_required()
def get_budget(budget_id):
    """Get a specific budget with details"""
    try:
        user_id = get_jwt_identity()
        
        budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not budget:
            return jsonify({
                'success': False,
                'error': 'Budget not found'
            }), 404
            
        budget_data = budget.to_dict()
        
        if budget.type == 'monthly':
            # Include categories with spending
            budget_data['categories'] = []
            for bc in budget.categories:
                category_data = bc.to_dict()
                
                # Calculate spent amount
                start_date = budget.start_date
                end_date = budget.end_date or date.today()
                
                spent = db.session.query(func.sum(Transaction.amount)).filter(
                    and_(
                        Transaction.user_id == user_id,
                        Transaction.category_id == bc.category_id,
                        Transaction.transaction_date >= start_date,
                        Transaction.transaction_date <= end_date
                    )
                ).scalar() or 0
                
                if category_data['category'] and category_data['category']['type'] == 'expense':
                    spent = abs(spent)
                    
                category_data['spent_amount'] = float(spent)
                category_data['remaining_amount'] = float(bc.allocated_amount - spent)
                category_data['percentage_used'] = round((spent / bc.allocated_amount * 100), 2) if bc.allocated_amount > 0 else 0
                
                budget_data['categories'].append(category_data)
                
        elif budget.type == 'goal':
            # Include goals
            budget_data['goals'] = [goal.to_dict() for goal in budget.goals]
            
        return jsonify({
            'success': True,
            'budget': budget_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch budget'
        }), 500

@budget_bp.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    """Create a new budget"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'type', 'amount', 'start_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'{field} is required'
                }), 400
                
        # Create budget
        budget = Budget(
            user_id=user_id,
            name=data['name'],
            type=data['type'],
            amount=data['amount'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            rollover_enabled=data.get('rollover_enabled', False)
        )
        
        db.session.add(budget)
        db.session.flush()  # Get the budget ID
        
        # Add categories if it's a monthly budget
        if data['type'] == 'monthly' and 'categories' in data:
            for cat_data in data['categories']:
                budget_category = BudgetCategory(
                    budget_id=budget.id,
                    category_id=cat_data['category_id'],
                    allocated_amount=cat_data['allocated_amount'],
                    remarks=cat_data.get('remarks'),
                    alert_threshold_50=cat_data.get('alert_threshold_50', True),
                    alert_threshold_75=cat_data.get('alert_threshold_75', True),
                    alert_threshold_90=cat_data.get('alert_threshold_90', True),
                    alert_threshold_100=cat_data.get('alert_threshold_100', True)
                )
                db.session.add(budget_category)
                
        # Add goal if it's a goal budget
        elif data['type'] == 'goal' and 'goal' in data:
            goal_data = data['goal']
            budget_goal = BudgetGoal(
                budget_id=budget.id,
                goal_name=goal_data['goal_name'],
                target_amount=goal_data['target_amount'],
                target_date=datetime.strptime(goal_data['target_date'], '%Y-%m-%d').date(),
                auto_contribute_amount=goal_data.get('auto_contribute_amount'),
                auto_contribute_frequency=goal_data.get('auto_contribute_frequency')
            )
            db.session.add(budget_goal)
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'budget': budget.to_dict(),
            'message': 'Budget created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create budget'
        }), 500

@budget_bp.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    """Update a budget"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not budget:
            return jsonify({
                'success': False,
                'error': 'Budget not found'
            }), 404
            
        # Update basic fields
        if 'name' in data:
            budget.name = data['name']
        if 'amount' in data:
            budget.amount = data['amount']
        if 'status' in data:
            budget.status = data['status']
        if 'rollover_enabled' in data:
            budget.rollover_enabled = data['rollover_enabled']
        if 'end_date' in data:
            budget.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data['end_date'] else None
            
        budget.updated_at = datetime.utcnow()
        
        # Update categories if provided
        if 'categories' in data and budget.type == 'monthly':
            # Remove existing categories
            BudgetCategory.query.filter_by(budget_id=budget.id).delete()
            
            # Add new categories
            for cat_data in data['categories']:
                budget_category = BudgetCategory(
                    budget_id=budget.id,
                    category_id=cat_data['category_id'],
                    allocated_amount=cat_data['allocated_amount'],
                    remarks=cat_data.get('remarks'),
                    alert_threshold_50=cat_data.get('alert_threshold_50', True),
                    alert_threshold_75=cat_data.get('alert_threshold_75', True),
                    alert_threshold_90=cat_data.get('alert_threshold_90', True),
                    alert_threshold_100=cat_data.get('alert_threshold_100', True)
                )
                db.session.add(budget_category)
                
        db.session.commit()
        
        return jsonify({
            'success': True,
            'budget': budget.to_dict(),
            'message': 'Budget updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update budget'
        }), 500

@budget_bp.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    """Delete a budget"""
    try:
        user_id = get_jwt_identity()
        
        budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not budget:
            return jsonify({
                'success': False,
                'error': 'Budget not found'
            }), 404
            
        db.session.delete(budget)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Budget deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete budget'
        }), 500

@budget_bp.route('/budgets/<int:budget_id>/summary', methods=['GET'])
@jwt_required()
def get_budget_summary(budget_id):
    """Get budget summary with spending analysis"""
    try:
        user_id = get_jwt_identity()
        
        budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not budget:
            return jsonify({
                'success': False,
                'error': 'Budget not found'
            }), 404
            
        summary = {
            'budget': budget.to_dict(),
            'total_allocated': float(budget.amount),
            'total_spent': 0,
            'total_remaining': 0,
            'categories_summary': []
        }
        
        if budget.type == 'monthly':
            for bc in budget.categories:
                # Calculate spent amount
                start_date = budget.start_date
                end_date = budget.end_date or date.today()
                
                spent = db.session.query(func.sum(Transaction.amount)).filter(
                    and_(
                        Transaction.user_id == user_id,
                        Transaction.category_id == bc.category_id,
                        Transaction.transaction_date >= start_date,
                        Transaction.transaction_date <= end_date
                    )
                ).scalar() or 0
                
                if bc.category and bc.category.type == 'expense':
                    spent = abs(spent)
                    
                category_summary = {
                    'category': bc.category.to_dict() if bc.category else None,
                    'allocated_amount': float(bc.allocated_amount),
                    'spent_amount': float(spent),
                    'remaining_amount': float(bc.allocated_amount - spent),
                    'percentage_used': round((spent / bc.allocated_amount * 100), 2) if bc.allocated_amount > 0 else 0,
                    'is_over_budget': spent > bc.allocated_amount
                }
                
                summary['categories_summary'].append(category_summary)
                summary['total_spent'] += spent
                
            summary['total_remaining'] = summary['total_allocated'] - summary['total_spent']
            summary['overall_percentage'] = round((summary['total_spent'] / summary['total_allocated'] * 100), 2) if summary['total_allocated'] > 0 else 0
            
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching budget summary: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch budget summary'
        }), 500

@budget_bp.route('/budgets/<int:budget_id>/goals/<int:goal_id>/contribute', methods=['POST'])
@jwt_required()
def contribute_to_goal(budget_id, goal_id):
    """Add contribution to a budget goal"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if 'amount' not in data:
            return jsonify({
                'success': False,
                'error': 'Amount is required'
            }), 400
            
        budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not budget or budget.type != 'goal':
            return jsonify({
                'success': False,
                'error': 'Goal budget not found'
            }), 404
            
        goal = BudgetGoal.query.filter_by(id=goal_id, budget_id=budget_id).first()
        if not goal:
            return jsonify({
                'success': False,
                'error': 'Goal not found'
            }), 404
            
        # Update current amount
        goal.current_amount += data['amount']
        goal.updated_at = datetime.utcnow()
        
        # Check if goal is completed
        if goal.current_amount >= goal.target_amount:
            budget.status = 'completed'
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'goal': goal.to_dict(),
            'message': 'Contribution added successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding contribution: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to add contribution'
        }), 500

@budget_bp.route('/budgets/copy/<int:budget_id>', methods=['POST'])
@jwt_required()
def copy_budget(budget_id):
    """Copy an existing budget as a template"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get source budget
        source_budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
        if not source_budget:
            return jsonify({
                'success': False,
                'error': 'Source budget not found'
            }), 404
            
        # Create new budget
        new_budget = Budget(
            user_id=user_id,
            name=data.get('name', f"Copy of {source_budget.name}"),
            type=source_budget.type,
            amount=source_budget.amount,
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if 'start_date' in data else date.today(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            rollover_enabled=source_budget.rollover_enabled
        )
        
        db.session.add(new_budget)
        db.session.flush()
        
        # Copy categories if monthly budget
        if source_budget.type == 'monthly':
            for bc in source_budget.categories:
                new_category = BudgetCategory(
                    budget_id=new_budget.id,
                    category_id=bc.category_id,
                    allocated_amount=bc.allocated_amount,
                    remarks=bc.remarks,
                    alert_threshold_50=bc.alert_threshold_50,
                    alert_threshold_75=bc.alert_threshold_75,
                    alert_threshold_90=bc.alert_threshold_90,
                    alert_threshold_100=bc.alert_threshold_100
                )
                db.session.add(new_category)
                
        # Copy goal if goal budget
        elif source_budget.type == 'goal' and source_budget.goals:
            source_goal = source_budget.goals[0]
            new_goal = BudgetGoal(
                budget_id=new_budget.id,
                goal_name=source_goal.goal_name,
                target_amount=source_goal.target_amount,
                target_date=source_goal.target_date,
                auto_contribute_amount=source_goal.auto_contribute_amount,
                auto_contribute_frequency=source_goal.auto_contribute_frequency
            )
            db.session.add(new_goal)
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'budget': new_budget.to_dict(),
            'message': 'Budget copied successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error copying budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to copy budget'
        }), 500