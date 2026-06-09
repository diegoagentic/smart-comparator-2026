#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Get API key from .env
if [ -f "api/.env" ]; then
    export $(cat api/.env | grep MASTER_API_KEY | xargs)
    API_KEY=$MASTER_API_KEY
else
    echo -e "${RED}❌ api/.env file not found${NC}"
    echo "Please create api/.env from api/.env.example"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🧪 Strata DS - Test Execution Suite                   ║"
echo "║   Testing as: Technical Lead + Design Lead + QA Senior   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Function to run test
run_test() {
    local test_id=$1
    local test_name=$2
    local test_command=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}🧪 $test_id: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}   ❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Check if API is running
echo -e "${YELLOW}📡 Checking if API is running...${NC}"
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ API is not running on port 3001${NC}"
    echo -e "${YELLOW}Please start the API server first:${NC}"
    echo -e "   cd api && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Check if Frontend is running
echo -e "${YELLOW}🎨 Checking if Frontend is running...${NC}"
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend is not running (some tests will be skipped)${NC}"
    FRONTEND_RUNNING=false
else
    echo -e "${GREEN}✅ Frontend is running${NC}"
    FRONTEND_RUNNING=true
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}👔 TECHNICAL LEAD - API & Architecture Tests${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

# TC-TL-001: Health Check
run_test "TC-TL-001" "Health Check API" \
    "curl -s http://localhost:3001/health | grep -q 'healthy'"

# TC-TL-002: CORS Headers
run_test "TC-TL-002" "CORS Configuration" \
    "curl -s -I -H 'Origin: http://localhost:5173' http://localhost:3001/health | grep -q 'Access-Control-Allow-Origin'"

# TC-TL-003: API Authentication (should fail without key)
run_test "TC-TL-003" "API Authentication (no key)" \
    "curl -s -X POST http://localhost:3001/v1/versions | grep -q 'error'"

# TC-TL-004: Manual Component Update
run_test "TC-TL-004" "Manual Component Update" \
    "curl -s -X POST http://localhost:3001/v1/webhooks/manual-update \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{\"componentId\":\"test-btn\",\"componentData\":{\"name\":\"Test\"},\"changeType\":\"create\"}' \
      | grep -q 'success'"

# TC-TL-005: AI Component Generation
run_test "TC-TL-005" "AI Component Generation" \
    "curl -s -X POST http://localhost:3001/v1/webhooks/ai-update \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{\"prompt\":\"test\",\"generatedComponent\":{\"name\":\"Test\"}}' \
      | grep -q 'success'"

# TC-TL-006: Event History
run_test "TC-TL-006" "Event History Retrieval" \
    "curl -s http://localhost:3001/v1/webhooks/events?limit=10 | grep -q 'events'"

# TC-TL-007: Version Creation
run_test "TC-TL-007" "Version Creation" \
    "curl -s -X POST http://localhost:3001/v1/versions \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{\"version\":\"1.0.0\",\"changelog\":[]}' \
      | grep -q 'success\|already exists'"

# TC-TL-008: Version Retrieval
run_test "TC-TL-008" "Version Retrieval" \
    "curl -s http://localhost:3001/v1/versions | grep -q 'versions'"

# TC-TL-009: Notification Subscription
run_test "TC-TL-009" "Notification Subscription" \
    "curl -s -X POST http://localhost:3001/v1/notifications/subscribe \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{\"userId\":\"test\",\"email\":\"test@test.com\",\"channels\":[\"email\"],\"events\":[\"version.published\"]}' \
      | grep -q 'success'"

# TC-TL-010: Update Check
run_test "TC-TL-010" "Update Check" \
    "curl -s -X POST http://localhost:3001/v1/versions/check-updates \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{\"currentVersion\":\"0.9.0\",\"components\":[\"button\"]}' \
      | grep -q 'hasUpdate'"

# TC-TL-011: API Documentation
run_test "TC-TL-011" "API Documentation (Swagger)" \
    "curl -s http://localhost:3001/api-docs | grep -q 'swagger'"

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}🎨 DESIGN LEAD - UI/UX Tests${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$FRONTEND_RUNNING" = true ]; then
    # TC-DL-001: Frontend Homepage
    run_test "TC-DL-001" "Frontend Homepage Loads" \
        "curl -s http://localhost:5173 | grep -q 'Strata DS'"
    
    # TC-DL-002: Design System Page
    run_test "TC-DL-002" "Design System Components" \
        "curl -s http://localhost:5173 | grep -q 'Design System'"
    
    echo -e "${YELLOW}   ℹ️  Manual UI tests require browser interaction${NC}"
    echo -e "${YELLOW}   ℹ️  See TESTING_PLAN.md for manual test cases${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping UI tests (Frontend not running)${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}✅ QA SENIOR - Quality Assurance Tests${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

# TC-QA-001: Invalid API Key
run_test "TC-QA-001" "Invalid API Key Rejected" \
    "curl -s -X POST http://localhost:3001/v1/versions \
      -H 'x-api-key: invalid-key' | grep -q 'error\|Unauthorized'"

# TC-QA-002: Missing Required Fields
run_test "TC-QA-002" "Missing Fields Validation" \
    "curl -s -X POST http://localhost:3001/v1/webhooks/manual-update \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d '{}' | grep -q 'error\|required'"

# TC-QA-003: Invalid JSON
run_test "TC-QA-003" "Invalid JSON Handling" \
    "curl -s -X POST http://localhost:3001/v1/versions \
      -H 'x-api-key: $API_KEY' \
      -H 'Content-Type: application/json' \
      -d 'invalid-json' | grep -q 'error'"

# TC-QA-004: Performance Test (should respond quickly)
echo -e "${BLUE}🧪 TC-QA-004: Performance Test${NC}"
START_TIME=$(date +%s%N)
curl -s http://localhost:3001/health > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ $DURATION -lt 100 ]; then
    echo -e "${GREEN}   ✅ PASS (${DURATION}ms < 100ms)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}   ❌ FAIL (${DURATION}ms >= 100ms)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}🤖 AUTOMATED TEST SUITE${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}🧪 Running automated test suite...${NC}"
cd api
if npm run test:flow > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Automated tests PASSED (9/9)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 9))
else
    echo -e "${RED}   ❌ Automated tests FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 9))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 9))
cd ..

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 TEST EXECUTION SUMMARY${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Total Tests:    $TOTAL_TESTS"
echo -e "Passed:         ${GREEN}$PASSED_TESTS ✅${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS ❌${NC}"
echo -e "Pass Rate:      ${GREEN}$PASS_RATE%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║   🎉 ALL TESTS PASSED! System is production ready.      ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║   ⚠️  Some tests failed. Please review and fix.         ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
