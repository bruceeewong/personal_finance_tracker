# Essential Memory - Personal Finance App

## Project Goal
Full-stack personal finance application for tracking income, expenses, accounts, and financial goals with real-time data visualization and budgeting features.

## Architecture
- **Frontend**: React with custom UI components (shadcn/ui)
- **Backend**: Flask with SQLAlchemy ORM
- **Database**: SQLite with normalized schema
- **Authentication**: JWT with refresh tokens
- **API**: RESTful design with proper error handling
- **Styling**: Tailwind CSS with responsive design

## Key File Structure
```
frontend/src/
├── pages/ (Dashboard, Accounts, Transactions, etc.)
├── components/ui/ (Card, Button, Input, etc.)
├── contexts/AuthContext.jsx
└── services/api.js

backend/src/
├── routes/ (auth, account, transaction, etc.)
├── models/ (User, Account, Transaction, Category)
├── database/app.db
└── main.py (Flask app)
```

## Database Schema (Key Tables)
- **users**: Authentication and profile data
- **accounts**: Financial accounts (checking, savings, etc.)
- **account_types**: Account categorization
- **transactions**: Income/expense records
- **categories**: Transaction categorization with icons
- **budgets**: Budget planning and tracking

## API Endpoints (Core)
- `/api/auth/login` - JWT authentication
- `/api/accounts` - Account CRUD
- `/api/transactions` - Transaction CRUD
- `/api/transactions/summary?month=YYYY-MM` - Monthly summaries
- `/api/categories` - Category management

## Test Account
- **Email**: `claude@test.com`
- **Password**: `Password123`
- Has sample transactions for June 2025
- Database: `/backend/src/database/app.db`