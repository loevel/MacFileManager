#!/bin/bash

# AndroidExplorer - Development launcher
# Starts both the Android API server and Electron app

set -e

echo "🚀 Starting AndroidExplorer development environment..."
echo ""

# Check if ports are available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  Port 8080 is already in use. Kill existing process:"
  echo "   lsof -ti:8080 | xargs kill -9"
  exit 1
fi

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

# Start Android API server
echo "📱 Starting Android API server on port 8080..."
cd "$(dirname "$0")/android"
npm run dev &
ANDROID_PID=$!
sleep 2

# Check if API is running
if ! kill -0 $ANDROID_PID 2>/dev/null; then
  echo "❌ Failed to start Android API server"
  exit 1
fi

# Start Electron app
echo "💻 Starting Electron app..."
cd "$(dirname "$0")/electron"
npm run dev &
ELECTRON_PID=$!

echo ""
echo "✅ Both services are running:"
echo "   Android API:  http://localhost:8080"
echo "   Electron:     http://localhost:5173"
echo ""
echo "📝 To connect in Electron:"
echo "   IP:   127.0.0.1"
echo "   Port: 8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait
