#!/bin/bash

# API Integration Tests
# Tests all endpoints with curl

set -e

API="http://localhost:8080"
PASSED=0
FAILED=0
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 API Integration Tests"
echo "========================"
echo "Testing API at: $API"
echo ""

# Test helper
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expect=$4

  echo -n "Testing: $name ... "

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API$endpoint")
  elif [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$API$endpoint")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API$endpoint")
  fi

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -1)

  if [ "$http_code" = "$expect" ]; then
    echo -e "${GREEN}✓ HTTP $http_code${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ Expected $expect, got $http_code${NC}"
    ((FAILED++))
    return 1
  fi
}

# Check API is running
echo "Checking API server..."
if ! curl -s "$API/health" > /dev/null 2>&1; then
  echo -e "${RED}✗ API not responding on $API${NC}"
  echo "Start with: ./run-dev.sh"
  exit 1
fi
echo -e "${GREEN}✓ API is running${NC}"
echo ""

# Test endpoints
echo "📊 Endpoint Tests"
echo "-----------------"

test_endpoint "Health Check" "GET" "/health" "200"
test_endpoint "List Directories" "GET" "/api/directories" "200"
test_endpoint "List Files (documents)" "GET" "/api/files?path=documents" "200"
test_endpoint "List Files (invalid)" "GET" "/api/files?path=nonexistent" "500"
test_endpoint "Directory Traversal Block" "GET" "/api/files?path=../../../../etc" "403"
test_endpoint "Upload (no file)" "POST" "/api/upload" "400"
test_endpoint "Delete (no path)" "DELETE" "/api/files" "400"

echo ""
echo "🔍 Response Validation"
echo "---------------------"

# Test response format
echo -n "Testing: Response format ... "
response=$(curl -s "$API/api/directories")
if echo "$response" | jq . > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Valid JSON${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Invalid JSON${NC}"
  ((FAILED++))
fi

# Test status field
echo -n "Testing: Status field in response ... "
status=$(curl -s "$API/api/directories" | jq -r '.status')
if [ "$status" = "success" ] || [ "$status" = "error" ]; then
  echo -e "${GREEN}✓ Status: $status${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Missing status field${NC}"
  ((FAILED++))
fi

# Test data field
echo -n "Testing: Data field in response ... "
if curl -s "$API/api/directories" | jq '.data' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Data field present${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Missing data field${NC}"
  ((FAILED++))
fi

echo ""
echo "📁 File Operations"
echo "------------------"

# Create test file
TEST_FILE="/tmp/test-file-$(date +%s).txt"
echo "test content" > "$TEST_FILE"

# Test upload
echo -n "Testing: File upload ... "
response=$(curl -s -w "\n%{http_code}" -F "file=@$TEST_FILE" \
  "$API/api/upload?path=documents")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ HTTP 200${NC}"
  ((PASSED++))
  # Extract uploaded filename for later tests
  UPLOADED_FILE=$(echo "$body" | jq -r '.data.path' 2>/dev/null)
else
  echo -e "${RED}✗ HTTP $http_code${NC}"
  ((FAILED++))
fi

# Test download (if we have an uploaded file)
if [ -n "$UPLOADED_FILE" ] && [ "$UPLOADED_FILE" != "null" ]; then
  echo -n "Testing: File download ... "
  response=$(curl -s -w "\n%{http_code}" \
    "$API/api/download?path=$UPLOADED_FILE")
  http_code=$(echo "$response" | tail -1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ HTTP 200${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ HTTP $http_code${NC}"
    ((FAILED++))
  fi

  # Test delete
  echo -n "Testing: File delete ... "
  response=$(curl -s -w "\n%{http_code}" -X DELETE \
    "$API/api/files?path=$UPLOADED_FILE")
  http_code=$(echo "$response" | tail -1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ HTTP 200${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ HTTP $http_code${NC}"
    ((FAILED++))
  fi
fi

# Cleanup
rm -f "$TEST_FILE"

echo ""
echo "🔒 Security Tests"
echo "-----------------"

echo -n "Testing: Path traversal protection ... "
response=$(curl -s -w "\n%{http_code}" \
  "$API/api/files?path=../../../../etc/passwd")
http_code=$(echo "$response" | tail -1)
status=$(echo "$response" | head -1 | jq -r '.status')

if [ "$http_code" = "403" ] || [ "$status" = "error" ]; then
  echo -e "${GREEN}✓ Blocked${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Allowed (security issue)${NC}"
  ((FAILED++))
fi

echo -n "Testing: Invalid path handling ... "
response=$(curl -s "$API/api/files?path=nonexistent")
if echo "$response" | jq . > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Returns valid JSON${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ Invalid response${NC}"
  ((FAILED++))
fi

echo ""
echo "⚡ Performance Tests"
echo "-------------------"

# Test response time
echo -n "Testing: Response time for listing files ... "
start=$(date +%s%N)
curl -s "$API/api/files?path=documents" > /dev/null
end=$(date +%s%N)
duration=$((($end - $start) / 1000000))

if [ $duration -lt 1000 ]; then
  echo -e "${GREEN}✓ ${duration}ms${NC}"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠ ${duration}ms (slow)${NC}"
fi

echo ""
echo "📊 Test Results"
echo "---------------"
total=$((PASSED + FAILED))
echo "Total: $total tests"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ All API tests passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
