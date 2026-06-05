#!/bin/bash

# Start Android File Server on Termux
# Copy this script to Termux and run: bash start-android-termux.sh

echo "🚀 AndroidExplorer - Termux Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "📦 Node.js not found. Installing..."
  echo ""
  echo "Running: pkg install nodejs npm"
  echo ""
  pkg install nodejs npm
  echo ""
fi

# Show Node.js version
echo "Node.js version:"
node --version
npm --version
echo ""

# Check if code exists
if [ ! -f "android/package.json" ]; then
  echo "❌ AndroidExplorer code not found in current directory"
  echo ""
  echo "Download or copy the code first:"
  echo "  git clone https://github.com/user/MacFileManager.git"
  echo "  cd MacFileManager"
  echo ""
  exit 1
fi

# Install dependencies
if [ ! -d "android/node_modules" ]; then
  echo "📦 Installing dependencies..."
  cd android
  npm install
  cd ..
  echo ""
fi

# Get the device IP
echo "🔍 Finding your device IP address..."
echo ""

# Try to get IP from various sources
if command -v hostname &> /dev/null; then
  DEVICE_NAME=$(hostname)
  echo "Device name: $DEVICE_NAME"
fi

# Get WiFi IP
WIFI_IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -1)
if [ -n "$WIFI_IP" ]; then
  echo "WiFi IP: $WIFI_IP"
else
  echo "WiFi IP: (connect to WiFi first)"
fi

echo ""
echo "To find your exact IP in Termux:"
echo "  ip addr show"
echo "  Look for line starting with 'inet' (usually 192.168.x.x)"
echo ""

# Start the server
echo "Starting Android File Server..."
echo ""

cd android
PORT=8080 npm run dev

# After server stops
echo ""
echo "🛑 Server stopped"
