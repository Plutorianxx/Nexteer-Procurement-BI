#!/bin/bash

# Nexteer Procurement BI - Quick Start Script
# This script starts both backend (FastAPI) and frontend (Vite) services

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "==============================================="
echo "  Nexteer Procurement BI - Starting Services"
echo "==============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo ""
    echo "${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "${GREEN}Services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check Python venv
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "${RED}Error: Python virtual environment not found at $BACKEND_DIR/venv${NC}"
    echo "Please run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check Node modules
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "${RED}Error: Node modules not found at $FRONTEND_DIR/node_modules${NC}"
    echo "Please run: cd frontend && npm install"
    exit 1
fi

# Start Backend
echo "${YELLOW}[1/2] Starting Backend (FastAPI)...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo "${GREEN}✓ Backend started (PID: $BACKEND_PID) - Logs: backend.log${NC}"
echo "   API URL: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "${YELLOW}[2/2] Starting Frontend (Vite)...${NC}"
cd "$FRONTEND_DIR"
nohup npm run dev -- --host > "$PROJECT_ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) - Logs: frontend.log${NC}"
echo "   Frontend URL: http://localhost:5173"
echo ""

# Wait for services to fully start
sleep 3

echo "==============================================="
echo "${GREEN}✓ All services are running!${NC}"
echo "==============================================="
echo ""
echo "Access Points:"
echo "  • Frontend:  http://localhost:5173"
echo "  • Backend:   http://localhost:8000"
echo "  • API Docs:  http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  • Backend:   tail -f backend.log"
echo "  • Frontend:  tail -f frontend.log"
echo ""
echo "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
