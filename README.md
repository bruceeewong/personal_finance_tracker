# Personal Finance Application

A modern, full-stack personal finance management application built with React and Flask.

## Project Structure

```
personal-finance-app/
├── backend/                    # Flask API backend
│   ├── src/
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── main.py            # Application entry point
│   ├── tests/                 # Backend tests
│   ├── config/                # Configuration files
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Backend container
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── common/        # Common UI components
│   │   │   └── features/      # Feature-specific components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # Global styles
│   ├── public/                # Static assets
│   ├── tests/                 # Frontend tests
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── Dockerfile             # Frontend container
├── database/
│   └── migrations/            # Database migrations
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
├── docker-compose.yml         # Docker composition
├── package.json               # Root package.json for scripts
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker and Docker Compose (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000) servers.

### Using Docker

```bash
docker-compose up
```

## Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install` - Install all dependencies
- `npm run build` - Build the frontend for production
- `npm run test` - Run all tests

### Backend
- `cd backend && python src/main.py` - Start backend server
- `cd backend && pytest` - Run backend tests

### Frontend
- `cd frontend && npm run dev` - Start frontend development server
- `cd frontend && npm run build` - Build for production
- `cd frontend && npm test` - Run frontend tests

## Features

- **Account Management**: Multiple account types (checking, savings, credit cards, crypto)
- **Transaction Tracking**: Categorized income and expense tracking
- **Shared Expenses**: Collaborate with partners on expense tracking
- **Investment Portfolio**: Track investments with P&L calculations
- **Budget Planning**: Set and monitor budgets by category
- **Financial Goals**: Track progress toward financial goals
- **Reports & Analytics**: Comprehensive financial insights
- **Mobile Responsive**: Optimized for all devices

## Technology Stack

### Backend
- Flask (Python web framework)
- SQLAlchemy (ORM)
- JWT (Authentication)
- PostgreSQL/SQLite (Database)

### Frontend
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Recharts (Data visualization)
- React Router (Navigation)

## API Documentation

API endpoints are available at `http://localhost:5000/api/`

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/accounts/*` - Account management
- `/api/transactions/*` - Transaction management
- `/api/investments/*` - Investment tracking
- `/api/budgets/*` - Budget management
- `/api/reports/*` - Financial reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.