import pytest
import json
from src.main import app, db
from src.models.user import User
from src.models.account import Account, AccountType, AccountBalanceHistory
from flask_jwt_extended import create_access_token

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Initialize default account types if they don't exist
            default_types = [
                {'name': 'Checking', 'description': 'Primary checking account'},
                {'name': 'Savings', 'description': 'Savings account'},
                {'name': 'Credit Card', 'description': 'Credit card account'},
            ]
            for type_data in default_types:
                existing = AccountType.query.filter_by(name=type_data['name']).first()
                if not existing:
                    account_type = AccountType(name=type_data['name'], description=type_data['description'])
                    db.session.add(account_type)
            db.session.commit()
            yield client

@pytest.fixture
def test_user(client):
    """Create test user"""
    # Check if user already exists
    existing_user = User.query.filter_by(email='test@example.com').first()
    if existing_user:
        return existing_user
    
    user = User(
        first_name='Test',
        last_name='User',
        email='test@example.com',
        password_hash='hashed_password'
    )
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def auth_headers(test_user):
    """Create authorization headers with JWT token"""
    token = create_access_token(identity=str(test_user.id))
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def test_account(test_user):
    """Create test account"""
    account = Account(
        user_id=test_user.id,
        name='Test Checking',
        account_type_id=1,
        balance=1000.0,
        currency='USD'
    )
    db.session.add(account)
    db.session.commit()
    return account

class TestAccountTypes:
    """Test account types endpoints"""
    
    def test_get_account_types_success(self, client, auth_headers):
        """Test successful retrieval of account types"""
        response = client.get('/api/account-types', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'account_types' in data
        assert len(data['account_types']) >= 3
        assert any(t['name'] == 'Checking' for t in data['account_types'])
    
    def test_get_account_types_no_auth(self, client):
        """Test account types endpoint without authentication"""
        response = client.get('/api/account-types')
        assert response.status_code == 401

class TestAccountsCRUD:
    """Test accounts CRUD operations"""
    
    def test_get_accounts_empty(self, client, auth_headers):
        """Test getting accounts when user has none"""
        response = client.get('/api/accounts', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['accounts'] == []
        assert 'message' in data
    
    def test_get_accounts_with_data(self, client, auth_headers, test_account):
        """Test getting accounts when user has accounts"""
        response = client.get('/api/accounts', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data['accounts']) == 1
        account = data['accounts'][0]
        assert account['name'] == 'Test Checking'
        assert account['balance'] == 1000.0
        assert account['currency'] == 'USD'
    
    def test_create_account_success(self, client, auth_headers):
        """Test successful account creation"""
        account_data = {
            'name': 'New Savings',
            'account_type_id': 2,
            'balance': 500.0,
            'currency': 'USD'
        }
        
        response = client.post('/api/accounts', 
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['account']['name'] == 'New Savings'
        assert data['account']['balance'] == 500.0
        assert data['account']['currency'] == 'USD'
        
        # Verify account was created in database
        account = Account.query.filter_by(name='New Savings').first()
        assert account is not None
        assert account.balance == 500.0
        
        # Verify balance history was created
        history = AccountBalanceHistory.query.filter_by(account_id=account.id).first()
        assert history is not None
        assert history.balance == 500.0
    
    def test_create_account_missing_name(self, client, auth_headers):
        """Test account creation without required name"""
        account_data = {
            'account_type_id': 1,
            'balance': 100.0
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'name is required' in data['error']
    
    def test_create_account_missing_type(self, client, auth_headers):
        """Test account creation without required account_type_id"""
        account_data = {
            'name': 'Test Account',
            'balance': 100.0
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'account_type_id is required' in data['error']
    
    def test_create_account_invalid_type(self, client, auth_headers):
        """Test account creation with invalid account_type_id"""
        account_data = {
            'name': 'Test Account',
            'account_type_id': 999,  # Non-existent type
            'balance': 100.0
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'Invalid account type' in data['error']
    
    def test_create_account_invalid_balance(self, client, auth_headers):
        """Test account creation with invalid balance format"""
        account_data = {
            'name': 'Test Account',
            'account_type_id': 1,
            'balance': 'invalid'
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'Invalid data format' in data['error']
    
    def test_create_account_no_data(self, client, auth_headers):
        """Test account creation with no JSON data"""
        response = client.post('/api/accounts', headers=auth_headers)
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'No data provided' in data['error']
    
    def test_get_single_account_success(self, client, auth_headers, test_account):
        """Test getting a single account successfully"""
        response = client.get(f'/api/accounts/{test_account.id}', headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['account']['name'] == test_account.name
        assert data['account']['balance'] == test_account.balance
    
    def test_get_single_account_not_found(self, client, auth_headers):
        """Test getting non-existent account"""
        response = client.get('/api/accounts/999', headers=auth_headers)
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert 'Account not found' in data['error']
    
    def test_update_account_success(self, client, auth_headers, test_account):
        """Test successful account update"""
        update_data = {
            'name': 'Updated Account Name',
            'balance': 1500.0
        }
        
        response = client.put(f'/api/accounts/{test_account.id}',
                            headers=auth_headers,
                            data=json.dumps(update_data))
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['account']['name'] == 'Updated Account Name'
        assert data['account']['balance'] == 1500.0
        
        # Verify balance history was created for balance change
        history_count = AccountBalanceHistory.query.filter_by(account_id=test_account.id).count()
        assert history_count >= 2  # Original + update
    
    def test_update_account_not_found(self, client, auth_headers):
        """Test updating non-existent account"""
        update_data = {'name': 'New Name'}
        
        response = client.put('/api/accounts/999',
                            headers=auth_headers,
                            data=json.dumps(update_data))
        assert response.status_code == 404
    
    def test_update_account_no_data(self, client, auth_headers, test_account):
        """Test updating account with no data"""
        response = client.put(f'/api/accounts/{test_account.id}', headers=auth_headers)
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'No data provided' in data['error']
    
    def test_delete_account_success(self, client, auth_headers, test_account):
        """Test successful account deletion (soft delete)"""
        response = client.delete(f'/api/accounts/{test_account.id}', headers=auth_headers)
        assert response.status_code == 200
        
        # Verify account is marked inactive, not deleted
        account = Account.query.get(test_account.id)
        assert account is not None
        assert account.is_active is False
        
        # Verify it doesn't appear in active accounts list
        response = client.get('/api/accounts', headers=auth_headers)
        data = json.loads(response.data)
        assert len(data['accounts']) == 0
    
    def test_delete_account_not_found(self, client, auth_headers):
        """Test deleting non-existent account"""
        response = client.delete('/api/accounts/999', headers=auth_headers)
        assert response.status_code == 404

class TestAccountSecurity:
    """Test account security and ownership"""
    
    def test_user_cannot_access_other_accounts(self, client, test_account):
        """Test that users cannot access accounts belonging to other users"""
        # Create another user
        other_user = User(
            first_name='Other',
            last_name='User', 
            email='other@example.com',
            password_hash='hashed_password'
        )
        db.session.add(other_user)
        db.session.commit()
        
        # Create token for other user
        token = create_access_token(identity=str(other_user.id))
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Try to access first user's account
        response = client.get(f'/api/accounts/{test_account.id}', headers=headers)
        assert response.status_code == 404
        
        # Try to update first user's account
        response = client.put(f'/api/accounts/{test_account.id}',
                            headers=headers,
                            data=json.dumps({'name': 'Hacked'}))
        assert response.status_code == 404
        
        # Try to delete first user's account
        response = client.delete(f'/api/accounts/{test_account.id}', headers=headers)
        assert response.status_code == 404

class TestAccountBalanceHistory:
    """Test account balance history functionality"""
    
    def test_get_balance_history(self, client, auth_headers, test_account):
        """Test getting account balance history"""
        # Create some balance history records
        history1 = AccountBalanceHistory(account_id=test_account.id, balance=1000.0)
        history2 = AccountBalanceHistory(account_id=test_account.id, balance=1200.0)
        db.session.add_all([history1, history2])
        db.session.commit()
        
        response = client.get(f'/api/accounts/{test_account.id}/balance-history', 
                            headers=auth_headers)
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert len(data['balance_history']) >= 2
        # Should be ordered by date descending
        assert data['balance_history'][0]['balance'] in [1000.0, 1200.0]
    
    def test_get_balance_history_account_not_found(self, client, auth_headers):
        """Test getting balance history for non-existent account"""
        response = client.get('/api/accounts/999/balance-history', headers=auth_headers)
        assert response.status_code == 404

class TestAccountValidation:
    """Test account validation edge cases"""
    
    def test_create_account_whitespace_name(self, client, auth_headers):
        """Test account creation with whitespace-only name"""
        account_data = {
            'name': '   ',
            'account_type_id': 1
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 201  # Should succeed after strip()
        
        data = json.loads(response.data)
        assert data['account']['name'] == ''  # Name should be empty after strip
    
    def test_create_account_default_values(self, client, auth_headers):
        """Test account creation with default values"""
        account_data = {
            'name': 'Minimal Account',
            'account_type_id': 1
        }
        
        response = client.post('/api/accounts',
                             headers=auth_headers,
                             data=json.dumps(account_data))
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['account']['balance'] == 0.0  # Default balance
        assert data['account']['currency'] == 'USD'  # Default currency
        assert data['account']['is_active'] is True  # Default active status
    
    def test_update_account_currency_case(self, client, auth_headers, test_account):
        """Test that currency is normalized to uppercase"""
        update_data = {'currency': 'eur'}
        
        response = client.put(f'/api/accounts/{test_account.id}',
                            headers=auth_headers,
                            data=json.dumps(update_data))
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['account']['currency'] == 'EUR'  # Should be uppercase