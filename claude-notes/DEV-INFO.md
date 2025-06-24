# Development Information

## Server Setup
- **Frontend**: `npm run dev` on port 3000
- **Backend**: `python src/main.py` on port 5001
- **Virtual Env**: `source venv/bin/activate` (backend)

## Development Workflow
1. Backend changes require server restart: `pkill -f "python.*main.py" && python src/main.py &`
2. Frontend auto-reloads with Vite
3. Database queries: `sqlite3 src/database/app.db`
4. Test data creation: `python create_test_data.py`

## Git Workflow
- Branch: `implement-transactions-page`
- Commit pattern: Brief memory dump → git commit
- Always include Claude Code attribution

## Key Debugging Commands
```bash
# Check servers
lsof -i :3000  # frontend
lsof -i :5001  # backend

# Database queries
sqlite3 src/database/app.db "SELECT * FROM transactions LIMIT 5;"
sqlite3 src/database/app.db "SELECT name, type, icon FROM categories;"

# API testing
curl -s http://localhost:5001/api/health
```

## Common Issues & Fixes
1. **Zero summaries**: Fixed API month parameter handling
2. **Wrong icons**: Fixed API to return full category objects
3. **Expense amounts**: Fixed frontend to auto-negate expense amounts
4. **Authentication**: Use test account credentials for development

## Code Patterns
- **API Responses**: `{success: true, data: {...}}`
- **Error Handling**: Try/catch with user-friendly messages
- **State Management**: useState hooks with proper loading states
- **Styling**: Consistent with existing AccountsPage patterns