#!/bin/bash

# Termux Setup Script for AndroidExplorer
# Run: bash TERMUX-SETUP.sh

echo "🚀 AndroidExplorer - Termux Setup"
echo "=================================="
echo ""

# Step 1: Check Node.js
echo "1️⃣  Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "   Installing Node.js..."
  pkg install -y nodejs npm
fi
node --version
npm --version
echo ""

# Step 2: Install dependencies
echo "2️⃣  Installing dependencies..."
npm install
echo ""

# Step 3: Build
echo "3️⃣  Building..."
npm run build
echo ""

# Step 4: Get IP address
echo "4️⃣  Your device IP address:"
IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -1)
if [ -z "$IP" ]; then
  IP="192.168.x.x (run 'ip addr show' to find)"
fi
echo "   $IP"
echo ""

# Step 5: Ready to start
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "   npm run dev"
echo ""
echo "Or:"
echo "   npm start"
echo ""
echo "Then connect from Electron with:"
echo "   IP: $IP"
echo "   Port: 8080"
echo ""
