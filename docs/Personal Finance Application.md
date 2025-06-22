# Personal Finance Application

A comprehensive personal finance web application built with React and Flask, optimized for mobile browsers.

## Features

- **Balance Management**: Track multiple account types including checking, savings, credit cards, and cryptocurrency wallets
- **Shared Expense Tracking**: Collaborate with your partner on expense tracking with historical data and accountability
- **Investment Monitoring**: Comprehensive portfolio tracking with profit/loss calculations and fee tracking
- **Mobile-First Design**: Optimized for mobile browsers with responsive design
- **Budgeting & Goals**: Set financial goals and track progress with detailed analytics
- **Reporting**: Comprehensive financial reports and data visualization

## Project Structure

```
personal-finance-app/
├── backend/                  # Flask API server
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   └── main.py          # Application entry point
│   └── requirements.txt
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── App.jsx          # Main app component
│   └── package.json
└── README.md
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Start the Flask server:
   ```bash
   python src/main.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Technology Stack

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database (development)
- **JWT**: Authentication
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI framework
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **Recharts**: Data visualization
- **React Router**: Navigation
- **Axios**: HTTP client

## Development

The application is built in phases:

1. **Core Infrastructure**: Authentication and database foundation
2. **Account Management**: Multi-account balance tracking
3. **Transaction Management**: Shared expense tracking with categorization
4. **Investment Portfolio**: Comprehensive investment monitoring
5. **Budgeting & Goals**: Financial planning and accountability
6. **Reporting & Analytics**: Historical data analysis and insights
7. **Advanced Features**: Automation and optimization

## License

This project is built for personal use. You own all the code and can modify, extend, and deploy it however you want.

