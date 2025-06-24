#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the app from main.py 
from src.main import app, db
from src.models.user import User
from src.models.account import Account, AccountType
from src.models.transaction import Transaction, Category
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

with app.app_context():
    # Create test user
    test_user = User.query.filter_by(email='claude@test.com').first()
    if not test_user:
        test_user = User(
            email='claude@test.com',
            password_hash=generate_password_hash('Password123'),
            first_name='Test',
            last_name='User',
            phone='1234567890'
        )
        db.session.add(test_user)
        db.session.commit()
        print(f"Created test user: {test_user.email}")
    else:
        print(f"Test user already exists: {test_user.email}")
    
    # Create test account
    test_account = Account.query.filter_by(user_id=test_user.id, name='Test Checking').first()
    if not test_account:
        checking_type = AccountType.query.filter_by(name='Checking').first()
        test_account = Account(
            user_id=test_user.id,
            name='Test Checking',
            account_type_id=checking_type.id,
            balance=5000.00,
            currency='USD'
        )
        db.session.add(test_account)
        db.session.commit()
        print(f"Created test account: {test_account.name}")
    
    # Get categories
    salary_cat = Category.query.filter_by(name='Salary').first()
    food_cat = Category.query.filter_by(name='Food & Dining').first()
    transport_cat = Category.query.filter_by(name='Transportation').first()
    entertainment_cat = Category.query.filter_by(name='Entertainment').first()
    
    # Create test transactions for current month
    current_date = datetime.now()
    test_transactions = [
        # Income
        {
            'user_id': test_user.id,
            'account_id': test_account.id,
            'category_id': salary_cat.id,
            'amount': 5000.00,
            'description': 'Monthly Salary',
            'transaction_date': current_date.replace(day=1)
        },
        # Expenses
        {
            'user_id': test_user.id,
            'account_id': test_account.id,
            'category_id': food_cat.id,
            'amount': -125.50,
            'description': 'Grocery Shopping',
            'transaction_date': current_date - timedelta(days=2)
        },
        {
            'user_id': test_user.id,
            'account_id': test_account.id,
            'category_id': transport_cat.id,
            'amount': -45.00,
            'description': 'Gas Station',
            'transaction_date': current_date - timedelta(days=3)
        },
        {
            'user_id': test_user.id,
            'account_id': test_account.id,
            'category_id': entertainment_cat.id,
            'amount': -85.00,
            'description': 'Movie Night',
            'transaction_date': current_date - timedelta(days=5)
        },
        {
            'user_id': test_user.id,
            'account_id': test_account.id,
            'category_id': food_cat.id,
            'amount': -22.99,
            'description': 'Lunch',
            'transaction_date': current_date - timedelta(days=1)
        }
    ]
    
    # Add transactions
    for trans_data in test_transactions:
        transaction = Transaction(**trans_data)
        db.session.add(transaction)
        print(f"Added transaction: {trans_data['description']} - ${trans_data['amount']}")
    
    db.session.commit()
    
    # Verify summary
    from sqlalchemy import func
    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == test_user.id,
        Transaction.amount > 0,
        Transaction.transaction_date >= current_date.replace(day=1)
    ).scalar() or 0
    
    total_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == test_user.id,
        Transaction.amount < 0,
        Transaction.transaction_date >= current_date.replace(day=1)
    ).scalar() or 0
    
    print(f"\nSummary for {current_date.strftime('%B %Y')}:")
    print(f"Total Income: ${total_income}")
    print(f"Total Expenses: ${abs(total_expense)}")
    print(f"Net: ${total_income + total_expense}")
    print(f"\nTest user credentials:")
    print(f"Email: test@example.com")
    print(f"Password: password123")