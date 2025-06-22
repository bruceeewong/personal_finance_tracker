# Personal Finance Application - Setup & Usage Guide

## 🎯 Overview

You now have a complete personal finance web application that addresses all your requirements:

- **Balance Management**: Track multiple account types (checking, savings, credit cards, crypto wallets)
- **Shared Expense Tracking**: Collaborate with your girlfriend on expense management
- **Investment Monitoring**: Comprehensive portfolio tracking with profit/loss analysis
- **Mobile-Optimized**: Perfect for use on mobile browsers with touch-friendly interface

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ installed
- Node.js 20+ installed
- Git (optional, for version control)

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd personal-finance-app/backend

# Activate the virtual environment
source venv/bin/activate

# Install dependencies (already done)
pip install -r requirements.txt

# Start the Flask server
python src/main.py
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd personal-finance-app/frontend

# Install dependencies (already done)
pnpm install

# Start the development server
pnpm dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the Application

Open your browser (mobile or desktop) and go to:
`http://localhost:5173`

## 📱 Mobile Usage

The application is fully optimized for mobile browsers:

- **Responsive Design**: Adapts perfectly to phone screens
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized for mobile networks
- **Offline-Ready**: Core functionality works without internet

## 🔐 Authentication

### Default Test Account
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Creating New Accounts
1. Click "Sign up" on the login page
2. Fill in your information
3. Password requirements:
   - At least 6 characters
   - Must contain at least one uppercase letter
   - Must contain at least one number

## 🏦 Core Features

### Account Management
- **Add Accounts**: Support for checking, savings, credit cards, crypto wallets
- **Balance Tracking**: Real-time balance updates
- **Account Types**: Categorized by type with custom icons
- **Multi-Currency**: Support for different currencies

### Transaction Management
- **Shared Expenses**: Tag transactions with who spent the money
- **Categories**: Organize expenses (Food, Transportation, Entertainment, etc.)
- **Historical Data**: Complete transaction history with search and filters
- **Monthly/Annual Reports**: Comprehensive spending analysis

### Investment Tracking
- **Portfolio Overview**: Real-time investment values
- **Profit/Loss Tracking**: Detailed P&L calculations
- **Trading Fees**: Track all associated costs
- **Performance Analytics**: Investment performance over time

### Budgeting & Goals
- **Budget Categories**: Set spending limits by category
- **Goal Tracking**: Save towards specific financial goals
- **Progress Monitoring**: Visual progress indicators
- **Alerts**: Notifications when approaching limits

## 🔧 Technical Architecture

### Backend (Flask)
- **API**: RESTful API with JWT authentication
- **Database**: SQLite for local use (PostgreSQL-ready for production)
- **Security**: Password hashing, JWT tokens, CORS enabled
- **Models**: Comprehensive data models for all financial entities

### Frontend (React)
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + React Query
- **Routing**: React Router for navigation
- **Icons**: Lucide React icons

### Database Schema
- **Users**: User accounts and authentication
- **Accounts**: Financial accounts (bank, credit, crypto)
- **Transactions**: All financial transactions
- **Investments**: Portfolio and investment tracking
- **Budgets**: Budget categories and limits
- **Goals**: Financial goals and progress

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Investments
- `GET /api/investments` - List investments
- `POST /api/investments` - Add investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Remove investment

### Budgets & Goals
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal

## 🛠 Customization

### Adding New Features
1. **Backend**: Add new models in `src/models/`
2. **API**: Create routes in `src/routes/`
3. **Frontend**: Add components in `src/components/`
4. **Pages**: Create new pages in `src/pages/`

### Styling Customization
- Modify `src/App.css` for global styles
- Use Tailwind classes for component styling
- Customize colors in the Tailwind config

### Database Customization
- Models are in `backend/src/models/`
- Migrations handled automatically by SQLAlchemy
- Switch to PostgreSQL by updating connection string

## 🚀 Deployment Options

### Local Network Access
```bash
# Backend: Modify main.py
app.run(host='0.0.0.0', port=5000)

# Frontend: Start with host flag
pnpm dev --host
```

### Cloud Deployment
1. **Backend**: Deploy to Heroku, Railway, or DigitalOcean
2. **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
3. **Database**: Use PostgreSQL on cloud provider

### Docker Deployment
```dockerfile
# Dockerfile examples included in project
docker-compose up -d
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: React Query for efficient data caching
- **Lazy Loading**: Components loaded on demand
- **Compression**: Gzip compression for API responses

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Python version (3.11+)
   - Ensure virtual environment is activated
   - Verify all dependencies installed

2. **Frontend won't start**
   - Check Node.js version (20+)
   - Run `pnpm install` to install dependencies
   - Clear browser cache

3. **Database errors**
   - Delete `instance/database.db` to reset database
   - Check file permissions
   - Ensure SQLite is available

4. **Authentication issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify API endpoints are accessible

### Development Tips

- Use browser developer tools for debugging
- Check console for JavaScript errors
- Monitor network tab for API call issues
- Use Flask debug mode for backend debugging

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Test with the default admin account first
4. Verify both backend and frontend are running

## 🎉 Next Steps

1. **Test the Application**: Create accounts, add transactions, explore features
2. **Customize**: Modify colors, add features, adjust to your needs
3. **Deploy**: Move to cloud hosting when ready for production use
4. **Backup**: Regularly backup your database
5. **Updates**: Keep dependencies updated for security

Your personal finance application is ready to use! Enjoy managing your finances with complete control and privacy.

