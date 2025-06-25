import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Import logging utilities
from src.utils.logger import (
    setup_logger, log_request_info, log_response_info, 
    log_jwt_operation, log_auth_event, app_logger
)

# Import all models to ensure they're registered
from src.models.user import db, User, UserRelationship, UserSession
from src.models.account import Account, AccountType, CryptoAccount, AccountBalanceHistory, init_account_types
from src.models.transaction import Transaction, Category, TransactionSplit, Transfer, init_default_categories
from src.models.investment import Investment, InvestmentType, InvestmentTransaction, PriceHistory, Dividend, init_investment_types
from src.models.budget import Budget, BudgetCategory, BudgetGoal, FinancialGoal, GoalContribution

# Import route blueprints
from src.routes.auth import auth_bp
from src.routes.user import user_bp
from src.routes.account import account_bp
from src.routes.transaction import transaction_bp
from src.routes.investment import investment_bp
from src.routes.budget import budget_bp

# Setup logging first
setup_logger()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app, 
     origins=["http://localhost:3000", "http://100.97.49.122:3000"], 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(account_bp, url_prefix='/api')
app.register_blueprint(transaction_bp, url_prefix='/api')
app.register_blueprint(investment_bp, url_prefix='/api')
app.register_blueprint(budget_bp, url_prefix='/api')

# Request/Response logging hooks
@app.before_request
def before_request():
    log_request_info()

@app.after_request
def after_request(response):
    return log_response_info(response)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    log_jwt_operation('EXPIRED', details=f"User ID: {jwt_payload.get('sub', 'unknown')}")
    return {'message': 'Token has expired'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    log_jwt_operation('INVALID', details=f"Error: {str(error)}")
    app_logger.error(f"🔑 Invalid JWT token: {error}")
    return {'message': 'Invalid token', 'details': str(error)}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    log_jwt_operation('MISSING', details=f"Error: {str(error)}")
    return {'message': 'Authorization token is required'}, 401

# Initialize database and default data
with app.app_context():
    db.create_all()
    
    # Initialize default data
    try:
        init_account_types()
        init_default_categories()
        init_investment_types()
        print("Default data initialized successfully")
    except Exception as e:
        print(f"Error initializing default data: {e}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'Personal Finance API is running'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

