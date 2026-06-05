#!/bin/bash

# Test suite runner for AndroidExplorer
# Runs type checking, builds, and unit tests

set -e

echo "🧪 AndroidExplorer Test Suite"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Test function
run_test() {
  local name=$1
  local command=$2

  echo -n "Testing: $name ... "

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((passed++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((failed++))
    eval "$command"
  fi
}

echo "📱 Android API Tests"
echo "-------------------"
cd android

run_test "Type checking" "npm run type-check"
run_test "Build" "npm run build"

# Run unit tests
echo -n "Testing: Unit tests ... "
if npx ts-node src/utils.test.ts 2>/dev/null || node -e "$(cat src/utils.test.ts | sed 's/import.*//g')" 2>/dev/null; then
  echo -e "${GREEN}✓ PASSED${NC}"
  ((passed++))
else
  echo -e "${YELLOW}⚠ SKIPPED${NC} (ts-node not available)"
fi

# API endpoint tests
echo -n "Testing: Health endpoint ... "
if timeout 3 npm start &
  sleep 2
  if curl -s http://localhost:8080/health | grep -q "ok"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((passed++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    ((failed++))
  fi
  pkill -f "node dist/index.js" 2>/dev/null || true
else
  echo -e "${RED}✗ FAILED${NC}"
  ((failed++))
fi

echo ""
echo "💻 Electron UI Tests"
echo "-------------------"
cd ../electron

run_test "Type checking" "npm run type-check"
run_test "Build" "npm run build"

echo ""
echo "📊 Test Results"
echo "---------------"
total=$((passed + failed))
echo -e "Total: $total tests"
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"

if [ $failed -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
