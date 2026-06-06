#!/bin/bash

# Fix NPM Vulnerabilities
# Run this to fix esbuild and other security issues

echo "🔧 Fixing NPM Vulnerabilities..."
echo ""

echo "Running: npm audit fix"
npm audit fix

echo ""
echo "Checking remaining issues:"
npm audit

echo ""
echo "✅ Done!"
echo ""
echo "To continue:"
echo "  npm run build"
echo "  npm start"
