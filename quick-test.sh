#!/bin/bash

# Quick test - starts API and runs tests

echo "🚀 Starting API server..."
cd android
npm start > /tmp/api.log 2>&1 &
API_PID=$!
sleep 3

cd ..

echo "✅ API started (PID: $API_PID)"
echo ""

# Run API tests
echo "Running API tests..."
./test-api.sh
TEST_RESULT=$?

# Cleanup
echo ""
echo "🛑 Stopping API..."
kill $API_PID 2>/dev/null || true

exit $TEST_RESULT
