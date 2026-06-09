# ⚡ Quickstart Guide - Strata DS Update System

## 🎯 Complete Setup in 5 Minutes

Follow these steps to get your Design System update infrastructure running.

---

## Step 1: Environment Setup (1 min)

### Backend Configuration

```bash
cd api
cp .env.example .env
```

Edit `/api/.env` with your credentials:

```bash
# Minimum required configuration
PORT=3001
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173

# Create a strong API key
MASTER_API_KEY=sk_live_$(openssl rand -hex 32)

# Create a webhook secret
FIGMA_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Your deployment URL (update for production)
API_BASE_URL=http://localhost:3001
```

### Frontend Configuration

```bash
cd ..
echo "VITE_API_URL=http://localhost:3001/v1" > .env
```

---

## Step 2: Install Dependencies (1 min)

```bash
# Install API dependencies
cd api
npm install

# Install frontend dependencies
cd ..
npm install
```

---

## Step 3: Start Servers (30 sec)

### Terminal 1 - API Server
```bash
cd api
npm run dev
```

You should see:
```
🎨 Strata DS API Server
Port:        3001
Version:     v1
- API Docs:     http://localhost:3001/api-docs
- Health:       http://localhost:3001/health
```

### Terminal 2 - Frontend
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Step 4: Verify Installation (30 sec)

### Test API Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": "99.98%",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Access Admin Panel
1. Open: http://localhost:5173
2. Click **"Admin Panel"** in sidebar
3. You should see the dashboard with stats

---

## Step 5: Test Complete Flow (2 min)

Run the automated test suite:

```bash
cd api
npm run test:flow
```

This will test:
- ✅ API Health Check
- ✅ Manual Component Update
- ✅ AI-Generated Component
- ✅ Figma Webhook (simulated)
- ✅ Event History
- ✅ Version Creation
- ✅ Version Retrieval
- ✅ Notification Subscription
- ✅ Update Check

Expected output:
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
   Total Tests: 9
   Passed: 9 ✅
   Failed: 0 ❌
   Success Rate: 100.0%

🎉 All tests passed! Your update flow is working perfectly.
```

---

## 🎉 You're Ready!

Your Design System update infrastructure is now running. Here's what you can do:

### Create Your First Component

**Option 1: Via Admin Panel**
1. Go to http://localhost:5173
2. Click **Admin Panel** → **Figma Sync** tab
3. Paste a Figma URL and click **Import from Figma**

**Option 2: Via API**
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "componentId": "my-button",
    "componentData": {
      "name": "My Button",
      "version": "1.0.0"
    },
    "changeType": "create",
    "description": "My first component"
  }'
```

### View Recent Updates

Visit: http://localhost:5173 → Admin Panel → Recent Updates tab

### Check Event History

```bash
curl http://localhost:3001/v1/webhooks/events?limit=10
```

---

## 🔧 Optional: Setup Figma Webhooks

If you want automatic sync from Figma:

### 1. Get Figma Credentials

**Figma Access Token:**
1. Go to: https://www.figma.com/developers/api#access-tokens
2. Click "Get personal access token"
3. Copy the token

**Figma Team ID:**
1. Go to your Figma team page
2. Copy the ID from URL: `figma.com/files/team/TEAM_ID_HERE/`

### 2. Update .env

Add to `/api/.env`:
```bash
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE
FIGMA_TEAM_ID=YOUR_TEAM_ID_HERE
```

### 3. Run Setup Script

```bash
cd api
npm run webhook:setup
```

This will:
- ✅ List existing webhooks
- ✅ Delete old Strata DS webhooks
- ✅ Create new webhooks for FILE_UPDATE, LIBRARY_PUBLISH, FILE_VERSION_UPDATE
- ✅ Verify configuration

### 4. Verify Webhooks

```bash
npm run webhook:verify
```

### 5. Test Webhook

Make a change in your Figma file and check:
```bash
curl http://localhost:3001/v1/webhooks/events?source=figma
```

---

## 📚 Next Steps

Now that everything is running:

1. **Read the Architecture** → `/ARCHITECTURE_STRATEGY.md`
2. **Full Setup Guide** → `/SETUP_GUIDE.md`
3. **API Documentation** → http://localhost:3001/api-docs
4. **Explore Components** → http://localhost:5173

---

## 🆘 Troubleshooting

### API won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process
kill -9 <PID>

# Restart
npm run dev
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Use different port
npm run dev -- --port 3000
```

### Tests fail
1. Make sure API is running on port 3001
2. Check API_KEY in .env matches test expectations
3. Run tests with verbose logging:
   ```bash
   DEBUG=* npm run test:flow
   ```

### Webhook setup fails
1. Verify FIGMA_ACCESS_TOKEN is valid
2. Verify FIGMA_TEAM_ID is correct
3. Check you have admin access to the Figma team
4. Ensure API_BASE_URL is accessible from internet (for production)

---

## 🎊 Success Checklist

Before moving to production, verify:

- ✅ API health check returns 200
- ✅ Admin panel loads correctly
- ✅ Can create components manually
- ✅ Event history is tracking updates
- ✅ Versions are being created
- ✅ Notifications can be subscribed
- ✅ All automated tests pass
- ✅ (Optional) Figma webhooks are active

---

**Time to first component: < 5 minutes** ⚡

**Questions?** Check `/SETUP_GUIDE.md` for detailed documentation.

**Ready for production?** See deployment section in `/SETUP_GUIDE.md`.
