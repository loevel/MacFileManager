#!/bin/bash

# Start Android File Server
# Usage: ./start-android.sh [port]

PORT=${1:-8080}
NODE_ENV=${NODE_ENV:-development}

echo "🚀 Starting Android File Server"
echo "==============================="
echo "Port: $PORT"
echo "Environment: $NODE_ENV"
echo ""

cd "$(dirname "$0")/android"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start the server
echo "Starting server..."
PORT=$PORT npm run dev

# Show connection info
echo ""
echo "✅ Server running!"
echo ""
echo "Local access:"
echo "  http://localhost:$PORT"
echo "  http://127.0.0.1:$PORT"
echo ""
echo "Network access:"
echo "  Find your Mac IP with: ifconfig | grep 'inet '"
echo "  Then use: http://YOUR_IP:$PORT"
echo ""
echo "API Endpoints:"
echo "  GET  /health"
echo "  GET  /api/directories"
echo "  GET  /api/files?path=documents"
echo "  POST /api/upload"
echo "  GET  /api/download?path=filename"
echo "  DEL  /api/files?path=filename"
echo ""
echo "Press Ctrl+C to stop"
