#!/bin/bash

# Load environment variables
BACKEND_PORT=${PORT:-5101}
FRONTEND_PORT=${PORT:-5100}

# Kill any existing processes on our ports
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

echo "Starting Personal Finance Application..."

# Start backend
echo "Starting backend server on port $BACKEND_PORT..."
cd backend
source venv/bin/activate
# Backend will read PORT from .env file
python src/main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port $FRONTEND_PORT..."
cd frontend
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Application started!"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend API: http://localhost:$BACKEND_PORT"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait