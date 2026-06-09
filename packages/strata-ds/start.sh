#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🎨 Strata DS - Quick Start Script                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install dependencies if needed
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️  Installing frontend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

if [ ! -d "api/node_modules" ]; then
    echo -e "${YELLOW}⚙️  Installing API dependencies...${NC}"
    cd api
    npm install
    cd ..
else
    echo -e "${GREEN}✅ API dependencies already installed${NC}"
fi

echo ""

# Check if .env file exists
if [ ! -f "api/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cp api/.env.example api/.env
    
    # Generate secure API key
    if command_exists openssl; then
        API_KEY="sk_live_$(openssl rand -hex 32)"
        WEBHOOK_SECRET="$(openssl rand -hex 32)"
        
        # Update .env file
        sed -i.bak "s/MASTER_API_KEY=.*/MASTER_API_KEY=$API_KEY/" api/.env
        sed -i.bak "s/FIGMA_WEBHOOK_SECRET=.*/FIGMA_WEBHOOK_SECRET=$WEBHOOK_SECRET/" api/.env
        rm api/.env.bak
        
        echo -e "${GREEN}✅ Generated secure API key and webhook secret${NC}"
    else
        echo -e "${YELLOW}⚠️  OpenSSL not found. Please manually update API key in api/.env${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating frontend .env file...${NC}"
    echo "VITE_API_URL=http://localhost:3001/v1" > .env
    echo -e "${GREEN}✅ Created frontend .env${NC}"
else
    echo -e "${GREEN}✅ Frontend .env already exists${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting servers...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start API server in background
echo -e "${BLUE}🔧 Starting API server on port 3001...${NC}"
cd api
npm run dev > ../api.log 2>&1 &
API_PID=$!
cd ..

# Wait for API to be ready
echo -e "${YELLOW}⏳ Waiting for API to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API server is ready!${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API server failed to start. Check api.log for errors.${NC}"
        cat api.log
        kill $API_PID 2>/dev/null
        exit 1
    fi
    
    sleep 1
done

echo ""

# Start frontend server in background
echo -e "${BLUE}🎨 Starting frontend server on port 5173...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend server is ready!${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend server failed to start. Check frontend.log for errors.${NC}"
        cat frontend.log
        kill $API_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    
    sleep 1
done

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ Strata DS is now running!                          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Frontend:${NC}     http://localhost:5173"
echo -e "${GREEN}🔧 API:${NC}          http://localhost:3001"
echo -e "${GREEN}📖 API Docs:${NC}     http://localhost:3001/api-docs"
echo -e "${GREEN}💚 Health Check:${NC} http://localhost:3001/health"
echo -e "${GREEN}🎛️  Admin Panel:${NC}  http://localhost:5173 → Admin Panel"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   API:      tail -f api.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Run tests
echo -e "${BLUE}🧪 Running tests to verify installation...${NC}"
echo ""

cd api
npm run test:flow

echo ""
echo -e "${GREEN}🎉 Setup complete! Your Design System is ready to use.${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "   1. Open http://localhost:5173 to see the design system"
echo "   2. Click 'Admin Panel' to manage components"
echo "   3. Read QUICKSTART.md for more information"
echo ""

# Keep script running
wait
