#!/bin/bash

# Nexteer Procurement BI - Stop Services Script

echo "Stopping Nexteer Procurement BI services..."

# Kill processes by port
echo "Stopping backend (port 8000)..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "No backend process found"

echo "Stopping frontend (port 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "No frontend process found"

echo "✓ All services stopped"
