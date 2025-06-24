from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import db
from ..models.transaction import Transaction, Category, Transfer
from ..models.account import Account
from datetime import datetime

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        user_id = get_jwt_identity()
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        
        transactions_data = []
        for transaction in transactions:
            account = Account.query.get(transaction.account_id)
            category = Category.query.get(transaction.category_id) if transaction.category_id else None
            
            transactions_data.append({
                'id': transaction.id,
                'account_id': transaction.account_id,
                'account_name': account.name if account else 'Unknown',
                'category_id': transaction.category_id,
                'category_name': category.name if category else 'Uncategorized',
                'amount': transaction.amount,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date.isoformat() if transaction.transaction_date else None,
                'created_at': transaction.created_at.isoformat() if transaction.created_at else None
            })
        
        return jsonify({
            'success': True,
            'transactions': transactions_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('account_id') or not data.get('amount'):
            return jsonify({'error': 'Account ID and amount are required'}), 400
        
        # Parse transaction date
        transaction_date = datetime.utcnow()
        if data.get('transaction_date'):
            try:
                transaction_date = datetime.fromisoformat(data['transaction_date'].replace('Z', '+00:00'))
            except:
                transaction_date = datetime.utcnow()
        
        transaction = Transaction(
            user_id=user_id,
            account_id=data['account_id'],
            category_id=data.get('category_id'),
            amount=float(data['amount']),
            description=data.get('description', ''),
            transaction_date=transaction_date
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # Get related data for response
        account = Account.query.get(transaction.account_id)
        category = Category.query.get(transaction.category_id) if transaction.category_id else None
        
        return jsonify({
            'success': True,
            'transaction': {
                'id': transaction.id,
                'account_id': transaction.account_id,
                'account_name': account.name if account else 'Unknown',
                'category_id': transaction.category_id,
                'category_name': category.name if category else 'Uncategorized',
                'amount': transaction.amount,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date.isoformat(),
                'created_at': transaction.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    try:
        user_id = get_jwt_identity()
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        account = Account.query.get(transaction.account_id)
        category = Category.query.get(transaction.category_id) if transaction.category_id else None
        
        return jsonify({
            'success': True,
            'transaction': {
                'id': transaction.id,
                'account_id': transaction.account_id,
                'account_name': account.name if account else 'Unknown',
                'category_id': transaction.category_id,
                'category_name': category.name if category else 'Uncategorized',
                'amount': transaction.amount,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date.isoformat() if transaction.transaction_date else None,
                'created_at': transaction.created_at.isoformat() if transaction.created_at else None
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    try:
        user_id = get_jwt_identity()
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'account_id' in data:
            transaction.account_id = data['account_id']
        if 'category_id' in data:
            transaction.category_id = data['category_id']
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'description' in data:
            transaction.description = data['description']
        if 'transaction_date' in data:
            try:
                transaction.transaction_date = datetime.fromisoformat(data['transaction_date'].replace('Z', '+00:00'))
            except:
                pass
        
        db.session.commit()
        
        # Get updated data for response
        account = Account.query.get(transaction.account_id)
        category = Category.query.get(transaction.category_id) if transaction.category_id else None
        
        return jsonify({
            'success': True,
            'transaction': {
                'id': transaction.id,
                'account_id': transaction.account_id,
                'account_name': account.name if account else 'Unknown',
                'category_id': transaction.category_id,
                'category_name': category.name if category else 'Uncategorized',
                'amount': transaction.amount,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date.isoformat() if transaction.transaction_date else None,
                'created_at': transaction.created_at.isoformat() if transaction.created_at else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    try:
        user_id = get_jwt_identity()
        transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    try:
        categories = Category.query.all()
        categories_data = [{
            'id': category.id,
            'name': category.name,
            'type': category.type,
            'icon': category.icon
        } for category in categories]
        
        return jsonify({
            'success': True,
            'categories': categories_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('type'):
            return jsonify({'error': 'Name and type are required'}), 400
        
        category = Category(
            name=data['name'],
            type=data['type'],
            icon=data.get('icon', '')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'category': {
                'id': category.id,
                'name': category.name,
                'type': category.type,
                'icon': category.icon
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions/transfer', methods=['POST'])
@jwt_required()
def create_transfer():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('from_account_id') or not data.get('to_account_id') or not data.get('amount'):
            return jsonify({'error': 'From account, to account, and amount are required'}), 400
        
        # Verify accounts belong to user
        from_account = Account.query.filter_by(id=data['from_account_id'], user_id=user_id).first()
        to_account = Account.query.filter_by(id=data['to_account_id'], user_id=user_id).first()
        
        if not from_account or not to_account:
            return jsonify({'error': 'Invalid account'}), 400
        
        transfer = Transfer(
            from_account_id=data['from_account_id'],
            to_account_id=data['to_account_id'],
            amount=float(data['amount']),
            transfer_date=datetime.utcnow()
        )
        
        db.session.add(transfer)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'transfer': {
                'id': transfer.id,
                'from_account_id': transfer.from_account_id,
                'from_account_name': from_account.name,
                'to_account_id': transfer.to_account_id,
                'to_account_name': to_account.name,
                'amount': transfer.amount,
                'transfer_date': transfer.transfer_date.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transaction_bp.route('/transactions/summary', methods=['GET'])
@jwt_required()
def get_transactions_summary():
    try:
        user_id = get_jwt_identity()
        
        # Get month parameter from query string (format: YYYY-MM)
        month_param = request.args.get('month')
        if month_param:
            try:
                year, month = month_param.split('-')
                target_year = int(year)
                target_month = int(month)
            except (ValueError, AttributeError):
                return jsonify({'error': 'Invalid month format. Use YYYY-MM'}), 400
        else:
            # Default to current month
            target_month = datetime.now().month
            target_year = datetime.now().year
        
        # Get monthly totals
        from sqlalchemy import func, extract
        
        monthly_income = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.amount > 0,
            extract('month', Transaction.transaction_date) == target_month,
            extract('year', Transaction.transaction_date) == target_year
        ).scalar() or 0
        
        monthly_expense = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.amount < 0,
            extract('month', Transaction.transaction_date) == target_month,
            extract('year', Transaction.transaction_date) == target_year
        ).scalar() or 0
        
        # Get recent transactions
        recent_transactions = Transaction.query.filter_by(user_id=user_id).order_by(
            Transaction.transaction_date.desc()
        ).limit(5).all()
        
        recent_data = []
        for transaction in recent_transactions:
            account = Account.query.get(transaction.account_id)
            category = Category.query.get(transaction.category_id) if transaction.category_id else None
            
            recent_data.append({
                'id': transaction.id,
                'account_name': account.name if account else 'Unknown',
                'category_name': category.name if category else 'Uncategorized',
                'amount': transaction.amount,
                'description': transaction.description,
                'transaction_date': transaction.transaction_date.isoformat() if transaction.transaction_date else None
            })
        
        return jsonify({
            'success': True,
            'summary': {
                'total_income': float(monthly_income),
                'total_expense': float(abs(monthly_expense)),
                'net_income': float(monthly_income + monthly_expense),
                'recent_transactions': recent_data
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500