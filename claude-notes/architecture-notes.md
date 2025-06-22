# Architecture Notes

## Project Structure 🏗️

```
personal_finance/
├── claude-notes/          # Claude's development notes
├── backend/
│   ├── logs/              # Application logs (api.log, app.log, error.log)
│   ├── src/
│   │   ├── database/      # SQLite database
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # Flask blueprints/endpoints  
│   │   ├── utils/         # Utilities (logger.py)
│   │   └── main.py        # Flask application entry point
│   ├── venv/              # Python virtual environment
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── ui/        # UI component library
    │   │   └── common/    # Shared components  
    │   ├── contexts/      # React contexts (AuthContext)
    │   ├── pages/         # Route components
    │   ├── services/      # API client (axios)
    │   └── lib/           # Utilities
    ├── package.json
    └── vite.config.js
```

## Technology Stack 💻

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (Flask-JWT-Extended)
- **CORS**: Flask-CORS
- **Logging**: Python logging with custom logger utility

### Frontend  
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management**: React Context + useReducer
- **UI Components**: Custom component library

## Key Configurations ⚙️

### Network Access
- **Frontend**: http://100.97.49.122:3000 (accessible via network)
- **Backend**: http://100.97.49.122:5001 (accessible via network)
- **CORS**: Configured for both localhost and IP access

### Authentication Flow
1. User submits login credentials
2. Backend validates and creates JWT tokens (access + refresh)
3. Tokens stored in localStorage with key 'access_token'
4. API requests include Bearer token in Authorization header
5. JWT tokens use string user IDs (not integers)

### JWT Configuration
- **Access Token Expiry**: 1 hour
- **Refresh Token Expiry**: 30 days
- **Identity Format**: String user ID (e.g., "1", not 1)
- **Storage**: localStorage with 'access_token' key

## Database Schema 📊

### Core Models
- **User**: Authentication and profile information
- **UserSession**: Track active user sessions
- **UserRelationship**: Partner/shared account relationships
- **Account**: Financial accounts (bank, credit, investment)
- **Transaction**: Financial transactions
- **Category**: Transaction categories
- **Budget**: Budget planning and tracking
- **Investment**: Investment portfolio tracking

## API Design 🔌

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### API Response Format
```json
{
  "message": "Success message",
  "data": { /* response data */ },
  "error": "Error message (if applicable)"
}
```

## Logging System 📝

### Log Files
- **api.log**: All HTTP requests/responses with timing
- **app.log**: General application events and debugging
- **error.log**: Error-specific logs with stack traces
- **backend.log**: Server stdout/stderr output

### Log Format
```
YYYY-MM-DD HH:MM:SS | LEVEL | logger_name | function:line | message
```

### Log Features
- Request/response tracking with client IP and timing
- JWT operation logging (creation, validation, errors)
- Authentication event tracking
- Database operation logging
- Sensitive data masking in logs

## Security Considerations 🔒

### Current Implementation
- JWT-based authentication
- CORS properly configured
- Password hashing (SQLAlchemy)
- Request logging for audit trails

### Security Notes
- JWT secret keys should be changed in production
- HTTPS should be enforced in production
- Rate limiting should be implemented
- Input validation needs enhancement
- Consider implementing CSRF protection

## Development Guidelines 📋

### Code Organization
- Keep business logic in models
- Use blueprints for route organization
- Implement consistent error handling
- Use logging extensively for debugging
- Follow RESTful API conventions

### Testing Strategy
- Unit tests for models and business logic
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing for critical flows

### Deployment Considerations
- Environment-specific configuration
- Database migration strategy
- Log aggregation and monitoring
- Health check endpoints
- Graceful shutdown handling