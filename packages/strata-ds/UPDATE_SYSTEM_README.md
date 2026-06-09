# 🎨 Strata DS - Design System Update & Sync Infrastructure

> **Enterprise-grade Design System as a Service (DSaaS)** with real-time synchronization, semantic versioning, and multi-channel notifications.

---

## 🚀 Quick Links

- **⚡ Get Started in 5 min:** [QUICKSTART.md](./QUICKSTART.md)
- **🏗️ Architecture & Strategy:** [ARCHITECTURE_STRATEGY.md](./ARCHITECTURE_STRATEGY.md)
- **📖 Complete Setup Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **🔗 API Documentation:** http://localhost:3001/api-docs (when running)
- **🎯 Admin Panel:** http://localhost:5173 → Admin Panel

---

## 📋 What's Included

### ✅ **Complete Update Infrastructure**

This implementation provides a **production-ready** system for managing design system updates with:

#### 🔄 **3 Update Sources**
1. **Figma Webhooks** - Automatic sync when Figma files change
2. **Manual Import** - Via admin panel or API
3. **AI Generation** - Create components with natural language prompts

#### 📦 **Semantic Versioning (semver)**
- Automatic version detection (MAJOR.MINOR.PATCH)
- Breaking change tracking
- AI-generated changelogs
- Migration guides for major updates

#### 🔔 **Multi-Channel Notifications**
- **Email** (SendGrid) - For critical updates
- **Webhooks** - For CI/CD integration
- **Slack** - For team collaboration
- **WebSocket** - For real-time dashboards

#### 🎛️ **Admin Panel**
- Real-time update feed
- Figma webhook configuration
- Manual component import
- Version management
- Notification settings
- Analytics dashboard

#### 🤖 **AI-Powered Features**
- Automatic changelog generation
- Component creation from prompts
- Breaking change detection
- Migration guide generation

---

## 🏗️ Architecture

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Figma     │  │  Figma Make  │  │  AI Prompts  │
│   Webhooks   │  │    Manual    │  │  Generation  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         ▼
              ┌──────────────────┐
              │  Processing      │
              │  Pipeline        │
              │  - Parse         │
              │  - Validate      │
              │  - Version       │
              │  - Notify        │
              └─────────┬────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
┌─────────────┐  ┌──────────┐  ┌─────────────┐
│  REST API   │  │WebSockets│  │     CDN     │
│  (Express)  │  │(Real-time)│  │ (Cloudflare)│
└──────┬──────┘  └────┬─────┘  └──────┬──────┘
       │              │               │
       └──────────────┼───────────────┘
                      ▼
         ┌────────────────────────┐
         │      Consumers         │
         │ - Developers (npm)     │
         │ - Designers (Figma)    │
         │ - AI Agents (MCP)      │
         │ - B2B Apps (iframe)    │
         └────────────────────────┘
```

---

## 📁 Project Structure

```
strata-ds/
├── api/                          # Backend API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── webhooks.ts      # Webhook handlers (Figma, Manual, AI)
│   │   │   ├── versions.ts      # Version management
│   │   │   ├── notifications.ts # Notification system
│   │   │   ├── components.ts    # Component endpoints
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── figma-webhook-setup.ts  # Figma webhook CLI
│   │   ├── utils/
│   │   │   └── test-update-flow.ts     # Automated test suite
│   │   └── server.ts            # Express server
│   ├── .env.example             # Environment variables template
│   └── package.json
│
├── src/                         # Frontend
│   └── app/
│       ├── components/
│       │   ├── AdminPanel.tsx   # Admin dashboard
│       │   ├── CodeViewer.tsx   # Code viewer with Figma export
│       │   ├── FigmaExport.tsx  # Figma export modal
│       │   └── ...
│       └── App.tsx
│
├── QUICKSTART.md               # 5-minute setup guide
├── SETUP_GUIDE.md              # Comprehensive setup guide
├── ARCHITECTURE_STRATEGY.md    # Architecture documentation
└── UPDATE_SYSTEM_README.md     # This file
```

---

## 🎯 Key Features

### For Developers

✅ **REST API** with full OpenAPI documentation
✅ **Semantic versioning** with automated changelogs
✅ **Breaking change warnings** with migration guides
✅ **npm package** auto-update detection
✅ **Webhook integration** for CI/CD pipelines
✅ **TypeScript types** auto-generated

### For Designers

✅ **Figma → Code** automatic sync
✅ **Visual component browser**
✅ **Export to Figma** (4 methods)
✅ **Real-time update notifications**
✅ **Version history** with visual diffs

### For AI Agents

✅ **MCP integration** (Model Context Protocol)
✅ **Natural language** component generation
✅ **Auto-update detection**
✅ **Contextual component suggestions**

### For Product Teams

✅ **Admin dashboard** with analytics
✅ **Version management** UI
✅ **User notification** configuration
✅ **Update approval** workflow
✅ **Rollback capability**

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- (Optional) Figma account for webhook integration

### Installation

**1. Clone and install:**
```bash
git clone <repository-url>
cd strata-ds
npm install
cd api && npm install && cd ..
```

**2. Configure environment:**
```bash
# Backend
cp api/.env.example api/.env
# Edit api/.env with your settings

# Frontend
echo "VITE_API_URL=http://localhost:3001/v1" > .env
```

**3. Start servers:**
```bash
# Terminal 1 - API
cd api && npm run dev

# Terminal 2 - Frontend
npm run dev
```

**4. Verify installation:**
```bash
cd api
npm run test:flow
```

**✅ See [QUICKSTART.md](./QUICKSTART.md) for detailed step-by-step guide**

---

## 📚 Available Scripts

### API Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build           # Build for production
npm start              # Start production server

# Figma Webhooks
npm run webhook:setup   # Setup Figma webhooks automatically
npm run webhook:verify  # Verify webhook configuration
npm run webhook:list    # List all webhooks

# Testing
npm run test:flow      # Run complete update flow test
npm test              # Run unit tests

# Code Quality
npm run lint          # Lint TypeScript
npm run format        # Format code with Prettier
```

### Frontend Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

---

## 🔧 Configuration

### Essential Environment Variables

```bash
# API Server
PORT=3001
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173

# Authentication
MASTER_API_KEY=sk_live_your_secret_key

# Figma Integration (optional)
FIGMA_ACCESS_TOKEN=figd_your_token
FIGMA_TEAM_ID=your_team_id
FIGMA_WEBHOOK_SECRET=your_webhook_secret

# Notifications (optional)
SENDGRID_API_KEY=SG.your_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

**See [api/.env.example](./api/.env.example) for complete configuration**

---

## 🧪 Testing

### Run Complete Test Suite

```bash
cd api
npm run test:flow
```

This tests:
- ✅ API health
- ✅ Manual component updates
- ✅ AI-generated components
- ✅ Figma webhook integration
- ✅ Event history tracking
- ✅ Version management
- ✅ Notification system
- ✅ Update detection

### Expected Output

```
✅ 1. Health Check - PASS (45ms)
✅ 2. Manual Component Update - PASS (123ms)
✅ 3. AI-Generated Component - PASS (156ms)
✅ 4. Figma Webhook (Simulated) - PASS (89ms)
✅ 5. Event History - PASS (34ms)
✅ 6. Version Creation - PASS (67ms)
✅ 7. Version Retrieval - PASS (23ms)
✅ 8. Notification Subscription - PASS (45ms)
✅ 9. Update Check - PASS (38ms)

📊 Summary:
   Passed: 9 ✅
   Success Rate: 100.0%
```

---

## 📖 API Endpoints

### Webhooks

```
POST /v1/webhooks/figma          # Figma webhook receiver
POST /v1/webhooks/manual-update  # Manual component update
POST /v1/webhooks/ai-update      # AI-generated component
GET  /v1/webhooks/events         # Event history
```

### Versions

```
GET  /v1/versions                # List all versions
POST /v1/versions                # Create new version
GET  /v1/versions/:version       # Get version details
GET  /v1/versions/latest/info    # Get latest version
POST /v1/versions/:version/publish  # Publish version
GET  /v1/versions/compare/:from/:to # Compare versions
POST /v1/versions/check-updates  # Check for updates
```

### Notifications

```
POST /v1/notifications/subscribe      # Subscribe to notifications
GET  /v1/notifications/:userId        # Get user notifications
POST /v1/notifications/mark-read      # Mark as read
PATCH /v1/notifications/subscriptions/:id  # Update subscription
```

**Full API documentation:** http://localhost:3001/api-docs

---

## 🎨 Admin Panel Features

Access at: **http://localhost:5173** → Admin Panel

### Dashboard Stats
- Current version
- Total components
- Recent update count
- Active users

### Recent Updates Tab
- Live feed of all component changes
- Source indicator (Figma/Manual/AI)
- Change type (Major/Minor/Patch)
- Status tracking

### Figma Sync Tab
- **Webhook Configuration**
  - Copy webhook URL
  - Setup instructions
  - Verification status

- **Manual Import**
  - Paste Figma file URL
  - Import components
  - Preview before importing

### Versions Tab
- Current version info
- Breaking changes count
- Publish new version
- Version history

### Notifications Tab
- Email notifications toggle
- Webhook notifications toggle
- Slack integration toggle
- Custom rules configuration

---

## 🔄 Update Workflow

### 1. Figma Changes (Automatic)

```
Designer makes change in Figma
          ↓
Figma webhook triggers
          ↓
API receives update
          ↓
Parse & validate component
          ↓
Determine version change
          ↓
Generate changelog
          ↓
Update database
          ↓
Notify subscribers
          ↓
Developer receives notification
```

### 2. Manual Update (Admin Panel)

```
Admin pastes Figma URL
          ↓
System fetches components
          ↓
Admin reviews changes
          ↓
Admin confirms import
          ↓
System processes update
          ↓
Version created/updated
          ↓
Notifications sent
```

### 3. AI-Generated (Prompt)

```
User provides prompt
          ↓
AI generates component
          ↓
System validates code
          ↓
Check against design tokens
          ↓
Create component
          ↓
Trigger version update
          ↓
Notify subscribers
```

---

## 🚀 Deployment

### Option 1: Traditional Hosting

```bash
# Build
npm run build
cd api && npm run build && cd ..

# Deploy with PM2
pm2 start api/dist/server.js --name strata-api
pm2 startup
pm2 save
```

### Option 2: Docker

```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Render, Heroku, AWS, Google Cloud

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) deployment section for details**

---

## 📊 Monitoring

### Health Endpoint

```bash
curl http://localhost:3001/health
```

### Metrics

Access at: `http://localhost:3001/metrics`

Tracks:
- API requests/second
- Webhook delivery success rate
- Notification engagement
- Version adoption rate
- Error rates
- Response times

---

## 🤝 Contributing

This is an internal design system infrastructure. For contributions:

1. Create feature branch
2. Implement changes
3. Run tests: `npm run test:flow`
4. Submit PR with description

---

## 📝 License

MIT License - Internal use only

---

## 🆘 Support

- **Documentation:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Architecture:** [ARCHITECTURE_STRATEGY.md](./ARCHITECTURE_STRATEGY.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **API Docs:** http://localhost:3001/api-docs
- **Issues:** Create GitHub issue
- **Email:** design-systems@strata.io

---

## ✨ What's Next?

After setup:

1. ✅ Configure Figma webhooks
2. ✅ Test complete flow
3. ✅ Create first component
4. ✅ Set up notifications
5. ✅ Enable MCP for AI
6. ✅ Deploy to production
7. ✅ Monitor metrics
8. ✅ Onboard team

---

**Built with ❤️ by the Strata DS Team**

*Last updated: December 2024*
