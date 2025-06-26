#!/bin/bash

# Account Import Script Runner
# This script sets up the environment and runs the account import

set -e

echo "🚀 Setting up environment for account import..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Set environment variables for production database
export DATABASE_URL="postgresql://postgres:test_password_123@localhost:5432/personal_finance"

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if production containers are running
echo "📋 Checking if production database is running..."
if ! docker-compose -f production/docker-compose.prod.yml ps db | grep -q "Up"; then
    echo "❌ Production database is not running!"
    echo "   Please start it first with: docker-compose -f production/docker-compose.prod.yml up -d db"
    exit 1
fi

echo "✅ Production database is running"

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
VENV_PATH="$PROJECT_ROOT/backend/venv"

if [[ ! -d "$VENV_PATH" ]]; then
    echo "❌ Virtual environment not found at: $VENV_PATH"
    echo "   Please create it first: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate the virtual environment
source "$VENV_PATH/bin/activate"

# Check if we can import required modules
python3 -c "
import sys, os
sys.path.insert(0, os.path.join('backend', 'src'))
try:
    from flask import Flask
    from models.user import db, User
    from models.account import Account, AccountType
    print('✅ All required Python modules are available')
except ImportError as e:
    print(f'❌ Missing required Python module: {e}')
    print('   Please install requirements: cd backend && source venv/bin/activate && pip install -r requirements.txt')
    sys.exit(1)
" || exit 1

# Default values
CSV_FILE="$SCRIPT_DIR/import_csv/accounts/family_accounts 1c7eb8e6b8f98025999fc737f809ebb0_all.csv"
USER_EMAIL="brulett@home.com"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --csv)
            CSV_FILE="$2"
            shift 2
            ;;
        --user)
            USER_EMAIL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--csv CSV_FILE] [--user USER_EMAIL]"
            echo ""
            echo "Options:"
            echo "  --csv CSV_FILE    Path to CSV file (default: import_csv/accounts/family_accounts...csv)"
            echo "  --user USER_EMAIL Email of user to import accounts for (default: brulett@home.com)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "📁 CSV File: $CSV_FILE"
echo "👤 User Email: $USER_EMAIL"

# Check if CSV file exists
if [[ ! -f "$CSV_FILE" ]]; then
    echo "❌ CSV file not found: $CSV_FILE"
    echo "   Available files:"
    find "$SCRIPT_DIR/import_csv" -name "*.csv" 2>/dev/null || echo "   No CSV files found in import_csv directory"
    exit 1
fi

echo ""
echo "🚀 Starting account import..."
echo "================================================"

# Run the import script
python3 "$SCRIPT_DIR/import_accounts.py" "$CSV_FILE" "$USER_EMAIL"

echo ""
echo "🎉 Import process completed!"
echo ""
echo "💡 You can verify the imported accounts by:"
echo "   1. Logging into the application as $USER_EMAIL"
echo "   2. Checking the accounts page"
echo "   3. Or querying the database directly"