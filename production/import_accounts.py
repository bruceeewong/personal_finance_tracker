#!/usr/bin/env python3
"""
Account CSV Import Script
Imports account data from CSV file into the database for a specific user.
"""

import sys
import os
import csv
import re
from datetime import datetime

# Add the backend src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'src'))

from flask import Flask
from models.user import db, User
from models.account import Account, AccountType, AccountBalanceHistory

def setup_app():
    """Initialize Flask app and database connection"""
    app = Flask(__name__)
    
    # Use production database URL or fallback to default
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:test_password_123@localhost:5432/personal_finance')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    return app

def clean_currency_amount(amount_str):
    """Clean currency string and convert to float"""
    if not amount_str or amount_str.strip() == '':
        return 0.0
    
    # Remove currency symbols, commas, and whitespace
    cleaned = re.sub(r'[^\d.-]', '', amount_str.replace(',', ''))
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def determine_account_type(type_str, account_name):
    """Determine account type based on CSV type and account name"""
    if not type_str:
        # Try to infer from account name
        account_name_lower = account_name.lower()
        if 'crypto' in account_name_lower or 'okx' in account_name_lower or 'whale' in account_name_lower or 'sui' in account_name_lower:
            return 'Crypto'
        elif '负债' in account_name or 'amex' in account_name_lower or 'discover' in account_name_lower or 'bilt' in account_name_lower:
            return 'Credit Card'
        else:
            return 'Checking'  # Default
    
    type_mapping = {
        'Bank': 'Checking',
        'Crypto': 'Crypto',
        'Credit': 'Credit Card'
    }
    
    return type_mapping.get(type_str, 'Checking')

def determine_currency(account_name, usd_balance, rmb_balance):
    """Determine currency based on which balance field has data"""
    if rmb_balance and rmb_balance != 0:
        return 'CNY'
    return 'USD'

def import_accounts_from_csv(csv_file_path, user_email):
    """Import accounts from CSV file for specified user"""
    
    app = setup_app()
    
    with app.app_context():
        # Find the user
        user = User.query.filter_by(email=user_email).first()
        if not user:
            print(f"❌ User with email {user_email} not found!")
            return False
        
        print(f"✅ Found user: {user.first_name} {user.last_name} (ID: {user.id})")
        
        # Read and process CSV
        imported_count = 0
        skipped_count = 0
        
        with open(csv_file_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                account_name = row['Account'].strip()
                person = row['Person'].strip()
                account_type_str = row['Type'].strip() if row['Type'] else ''
                
                # Skip if not for the specified person (assuming Bruski = brulett@home.com)
                if person.lower() != 'bruski':
                    print(f"⏭️  Skipping account '{account_name}' - belongs to {person}")
                    skipped_count += 1
                    continue
                
                # Clean balance amounts
                usd_current = clean_currency_amount(row['current Balance (USD)'])
                rmb_current = clean_currency_amount(row['current Balance (RMB)'])
                
                # Determine currency and balance
                currency = determine_currency(account_name, usd_current, rmb_current)
                balance = rmb_current if currency == 'CNY' else usd_current
                
                # Handle negative balances (debt accounts)
                if '负债' in account_name or balance < 0:
                    account_type_name = 'Credit Card'
                    # Keep negative balance to represent debt
                else:
                    account_type_name = determine_account_type(account_type_str, account_name)
                
                # Get or create account type
                account_type = AccountType.query.filter_by(name=account_type_name).first()
                if not account_type:
                    print(f"⚠️  Account type '{account_type_name}' not found, using 'Checking'")
                    account_type = AccountType.query.filter_by(name='Checking').first()
                
                # Check if account already exists
                existing_account = Account.query.filter_by(
                    user_id=user.id,
                    name=account_name
                ).first()
                
                if existing_account:
                    print(f"⚠️  Account '{account_name}' already exists, updating balance...")
                    existing_account.balance = balance
                    existing_account.currency = currency
                    account = existing_account
                else:
                    # Create new account
                    account = Account(
                        user_id=user.id,
                        name=account_name,
                        account_type_id=account_type.id if account_type else None,
                        balance=balance,
                        currency=currency,
                        is_active=True
                    )
                    db.session.add(account)
                    print(f"✅ Created account '{account_name}' with balance {balance} {currency}")
                
                # Add to balance history
                db.session.flush()  # Get the account ID
                balance_history = AccountBalanceHistory(
                    account_id=account.id,
                    balance=balance,
                    recorded_at=datetime.utcnow()
                )
                db.session.add(balance_history)
                
                imported_count += 1
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"\n🎉 Import completed successfully!")
            print(f"   📊 Imported: {imported_count} accounts")
            print(f"   ⏭️  Skipped: {skipped_count} accounts")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error committing to database: {e}")
            return False

def main():
    if len(sys.argv) != 3:
        print("Usage: python import_accounts.py <csv_file_path> <user_email>")
        print("Example: python import_accounts.py ./import_csv/accounts/family_accounts.csv brulett@home.com")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    user_email = sys.argv[2]
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file not found: {csv_file}")
        sys.exit(1)
    
    print(f"🚀 Starting account import...")
    print(f"   📁 CSV File: {csv_file}")
    print(f"   👤 User Email: {user_email}")
    print("-" * 50)
    
    success = import_accounts_from_csv(csv_file, user_email)
    
    if success:
        print("\n✅ Account import completed successfully!")
    else:
        print("\n❌ Account import failed!")
        sys.exit(1)

if __name__ == '__main__':
    main()