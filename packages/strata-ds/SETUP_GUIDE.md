# 🚀 Quick Setup Guide - Strata DS Update System

## Overview

This guide will help you set up the complete Design System update and synchronization infrastructure in **under 30 minutes**.

---

## Prerequisites

- Node.js 18+ installed
- Figma account (for webhook integration)
- npm or yarn package manager
- (Optional) Docker for containerized deployment

---

## 1. API Server Setup

### Step 1: Install Dependencies

```bash
cd api
npm install
```

### Step 2: Environment Configuration

Create `/api/.env`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
API_VERSION=v1

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,https://your-domain.com

# API Authentication
API_KEY_REQUIRED=true
MASTER_API_KEY=sk_live_your_secret_key_here

# Figma Webhook
FIGMA_WEBHOOK_SECRET=your_figma_webhook_secret

# Database (optional - using in-memory for demo)
DATABASE_URL=postgresql://user:password@localhost:5432/strata_ds

# Notifications
SENDGRID_API_KEY=your_sendgrid_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Start API Server

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Docker
docker-compose up -d
```

**API will be available at:** `http://localhost:3001`

---

## 2. Frontend Setup

### Step 1: Install Dependencies

```bash
cd ..  # Back to root
npm install
```

### Step 2: Environment Configuration

Create `/.env`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/v1
VITE_WEBSOCKET_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_MCP=true
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## 3. Figma Webhook Configuration

### Option A: Using Figma API (Recommended)

```bash
# Install Figma CLI
npm install -g @figma/cli

# Create webhook
figma webhook create \
  --file-key YOUR_FILE_KEY \
  --event FILE_UPDATE \
  --endpoint https://your-api.com/v1/webhooks/figma \
  --passcode your_figma_webhook_secret
```

### Option B: Using Figma UI

1. Open your Figma file
2. Go to **File** → **Settings** → **Webhooks**
3. Click **"Create webhook"**
4. Configure:
   ```
   Webhook URL: https://your-api.com/v1/webhooks/figma
   Events: FILE_UPDATE, LIBRARY_PUBLISH, FILE_VERSION_UPDATE
   Secret: your_figma_webhook_secret
   ```
5. Save and test

### Verify Webhook

```bash
# Send test webhook
curl -X POST http://localhost:3001/v1/webhooks/figma \
  -H "Content-Type: application/json" \
  -H "x-figma-signature: your_signature" \
  -d '{
    "event_type": "FILE_UPDATE",
    "file_key": "test123",
    "file_name": "Design System Components",
    "timestamp": "2024-01-15T10:00:00Z"
  }'
```

---

## 4. Testing the System

### Test Manual Component Update

```bash
# Create a component via API
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_your_secret_key_here" \
  -d '{
    "componentId": "button-primary",
    "componentData": {
      "name": "Primary Button",
      "version": "1.0.0"
    },
    "changeType": "create",
    "description": "Initial button component"
  }'
```

### Test AI-Generated Component

```bash
curl -X POST http://localhost:3001/v1/webhooks/ai-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_your_secret_key_here" \
  -d '{
    "prompt": "Create a success alert component",
    "generatedComponent": {
      "name": "SuccessAlert",
      "react": "export function SuccessAlert() { ... }",
      "html": "<div class=\"alert-success\">...</div>"
    }
  }'
```

### Check Version History

```bash
# Get all versions
curl http://localhost:3001/v1/versions

# Get specific version
curl http://localhost:3001/v1/versions/1.0.0

# Get latest version
curl http://localhost:3001/v1/versions/latest/info
```

### Check Update Events

```bash
# Get recent events
curl http://localhost:3001/v1/webhooks/events?limit=10

# Filter by source
curl http://localhost:3001/v1/webhooks/events?source=figma&limit=5
```

---

## 5. Notification Setup

### Email Notifications (SendGrid)

```bash
# Subscribe to notifications
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_your_secret_key_here" \
  -d '{
    "userId": "user_123",
    "email": "developer@example.com",
    "channels": ["email"],
    "events": ["version.published", "breaking.change"],
    "minSeverity": "warning"
  }'
```

### Webhook Notifications

```bash
# Subscribe with webhook
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_your_secret_key_here" \
  -d '{
    "userId": "user_123",
    "webhookUrl": "https://your-app.com/webhooks/design-system",
    "channels": ["webhook"],
    "events": ["component.updated", "version.published"],
    "components": ["button", "alert", "modal"]
  }'
```

### Slack Notifications

```bash
# Subscribe with Slack webhook
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_live_your_secret_key_here" \
  -d '{
    "userId": "team_design",
    "slackWebhook": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "channels": ["slack"],
    "events": ["version.published", "component.deprecated"],
    "minSeverity": "info"
  }'
```

---

## 6. Admin Panel Access

1. Navigate to: `http://localhost:5173`
2. Click **"Admin Panel"** in the sidebar
3. You'll see:
   - **Recent Updates**: Live feed of component changes
   - **Figma Sync**: Manual import and webhook configuration
   - **Versions**: Version management and publishing
   - **Notifications**: Configure notification settings

### Admin Panel Features

#### Import from Figma
1. Go to **"Figma Sync"** tab
2. Paste Figma file URL: `https://www.figma.com/file/abc123/...`
3. Click **"Import from Figma"**
4. Review changes
5. Confirm import

#### Publish New Version
1. Go to **"Versions"** tab
2. Click **"Publish New Version"**
3. Select version type (major/minor/patch)
4. Add changelog entries
5. Review breaking changes
6. Click **"Publish"**

---

## 7. SDK Integration (for Consumers)

### Install SDK

```bash
npm install @strata-ds/sdk
```

### Initialize in Your App

```typescript
import { StrataDS } from '@strata-ds/sdk';

const ds = new StrataDS({
  apiUrl: 'https://api.strata-ds.com/v1',
  apiKey: 'your_api_key',
  version: 'latest', // or specific version like '1.2.0'
  autoUpdate: true, // Auto-fetch new versions
});

// Listen for updates
ds.on('update', (update) => {
  console.log(`New version available: ${update.version}`);
  console.log('Changelog:', update.changelog);
  
  if (update.hasBreakingChanges) {
    console.warn('Breaking changes detected!');
    console.log('Migration guide:', update.migrationGuideUrl);
  }
});

// Check for updates manually
const updateInfo = await ds.checkForUpdates();
if (updateInfo.hasUpdate) {
  console.log(`Update available: ${updateInfo.latestVersion}`);
}

// Get component
const Button = await ds.getComponent('button');
```

---

## 8. MCP Integration (for AI Agents)

### Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strata-ds": {
      "command": "npx",
      "args": ["@strata-ds/mcp-client"],
      "env": {
        "STRATA_API_URL": "https://api.strata-ds.com/v1",
        "STRATA_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Test MCP Connection

Ask Claude:
```
"Using Strata DS, create a primary button component with 
dark mode support and all variants (small, medium, large)"
```

Claude will:
1. Query the MCP server for button specifications
2. Fetch the latest component code
3. Generate the component with correct styling
4. Include all variants and states

---

## 9. Troubleshooting

### API Server Not Starting

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Restart server
npm run dev
```

### Figma Webhook Not Receiving Events

1. Check webhook signature validation
2. Verify FIGMA_WEBHOOK_SECRET in .env
3. Test with curl (see section 3)
4. Check server logs: `tail -f api/logs/server.log`

### CORS Errors

Add your frontend URL to CORS_ORIGIN in `/api/.env`:
```bash
CORS_ORIGIN=http://localhost:5173,https://your-domain.com
```

### Database Connection Issues

If using PostgreSQL:
```bash
# Test connection
psql -h localhost -U your_user -d strata_ds

# Run migrations
npm run migrate
```

---

## 10. Production Deployment

### Option A: Traditional Hosting

```bash
# Build frontend
npm run build

# Build API
cd api
npm run build

# Start with PM2
pm2 start dist/server.js --name strata-api
pm2 startup
pm2 save
```

### Option B: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Scale API instances
docker-compose up -d --scale api=3
```

### Option C: Cloud Platforms

**Vercel (Frontend):**
```bash
vercel --prod
```

**Railway (API):**
```bash
railway up
```

**AWS/Google Cloud:**
- Use provided Dockerfile
- Configure environment variables
- Set up load balancer
- Enable auto-scaling

---

## 11. Monitoring & Analytics

### Health Checks

```bash
# API health
curl http://localhost:3001/health

# Response:
{
  "status": "healthy",
  "uptime": "99.98%",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Metrics Dashboard

Access at: `http://localhost:3001/metrics`

Metrics include:
- API requests/second
- Webhook delivery success rate
- Notification open rates
- Version adoption rates
- Error rates

---

## 12. Next Steps

After setup:

1. ✅ **Create your first component** via admin panel
2. ✅ **Set up Figma webhook** for automatic sync
3. ✅ **Configure notifications** for your team
4. ✅ **Test SDK integration** in a sample app
5. ✅ **Enable MCP** for AI-powered development
6. ✅ **Monitor metrics** and adjust as needed

---

## Support

- **Documentation:** [https://docs.strata-ds.com](https://docs.strata-ds.com)
- **API Reference:** `http://localhost:3001/api-docs`
- **GitHub Issues:** [https://github.com/your-org/strata-ds/issues](https://github.com/your-org/strata-ds/issues)
- **Slack Community:** [Join here](https://slack.strata-ds.com)
- **Email:** support@strata-ds.com

---

**Congratulations! 🎉** Your Design System update infrastructure is now live and ready to serve developers, designers, and AI agents with real-time component synchronization.
