#!/bin/bash

# AndroidExplorer - Production launcher
# Starts the Android API server on port 8080

echo "🚀 Starting AndroidExplorer API Server (Production)..."
echo ""

# Check if port is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "❌ Port 8080 is already in use."
  exit 1
fi

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

cd "$(dirname "$0")/android"
npm start
