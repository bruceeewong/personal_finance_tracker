#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
BACKEND_PORT=${BACKEND_PORT:-5101}
FRONTEND_PORT=${FRONTEND_PORT:-5100}

echo -e "${GREEN}Starting Personal Finance Application${NC}"
echo -e "${YELLOW}Backend Port: $BACKEND_PORT${NC}"
echo -e "${YELLOW}Frontend Port: $FRONTEND_PORT${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Kill any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

# Start backend
echo -e "${GREEN}Starting backend server on port $BACKEND_PORT...${NC}"
cd backend
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
fi
python src/main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start!${NC}"
    exit 1
fi

# Test backend
if curl -s -f http://localhost:$BACKEND_PORT/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Start frontend
echo -e "${GREEN}Starting frontend server on port $FRONTEND_PORT...${NC}"
cd frontend
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo -e "\n${GREEN}===========================================${NC}"
echo -e "${GREEN}Application started successfully!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:$FRONTEND_PORT${NC}"
echo -e "Backend API: ${YELLOW}http://localhost:$BACKEND_PORT${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers...${NC}\n"

# Keep the script running
wait