#!/bin/bash

# Kill any existing processes on our ports
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Starting Personal Finance Application..."

# Start backend
echo "Starting backend server on port 5001..."
cd backend
source venv/bin/activate
FLASK_RUN_PORT=5001 python src/main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait