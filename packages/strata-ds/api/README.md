# Strata DS API

RESTful API for the Strata DS White Label Design System. Programmatically access all design foundations, components, tokens, and AI prompts.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The API will be available at `http://localhost:3000`

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔑 Authentication

All API endpoints (except `/health` and `/api-docs`) require authentication.

### API Key Authentication

Include your API key in the request header:

```bash
curl -H "x-api-key: your-api-key" http://localhost:3000/v1/components
```

### Bearer Token Authentication

Alternatively, use a JWT Bearer token:

```bash
curl -H "Authorization: Bearer your-jwt-token" http://localhost:3000/v1/components
```

### Test API Keys

For development, use these test keys:
- `strata_test_key_12345`
- `strata_demo_key_67890`

**⚠️ Never use these in production!**

## 🛣️ API Endpoints

### Foundations

- `GET /v1/foundations` - Get all foundations
- `GET /v1/foundations/colors` - Get color palette
- `GET /v1/foundations/typography` - Get typography system
- `GET /v1/foundations/spacing` - Get spacing system
- `GET /v1/foundations/borders` - Get border system
- `GET /v1/foundations/shadows` - Get shadow system

### Components

- `GET /v1/components` - List all components
  - Query params: `?category=Application UI`, `?status=ai-ready`
- `GET /v1/components/:id` - Get component by ID
- `GET /v1/components/:id/code/:format` - Get component code
  - Formats: `react`, `html`, `css`, `ai-prompt`
- `GET /v1/components/:id/tokens` - Get component tokens

### Search

- `GET /v1/search?q=button` - Search components
  - Query params: `?q=query&limit=20`

## 📖 Examples

### Get All Components

```bash
curl -H "x-api-key: strata_test_key_12345" \
  http://localhost:3000/v1/components
```

### Get Button Component

```bash
curl -H "x-api-key: strata_test_key_12345" \
  http://localhost:3000/v1/components/button
```

### Get React Code for Button

```bash
curl -H "x-api-key: strata_test_key_12345" \
  http://localhost:3000/v1/components/button/code/react
```

### Get Color Palette

```bash
curl -H "x-api-key: strata_test_key_12345" \
  http://localhost:3000/v1/foundations/colors
```

### Search Components

```bash
curl -H "x-api-key: strata_test_key_12345" \
  "http://localhost:3000/v1/search?q=button&limit=10"
```

## 🐳 Docker

### Build Image

```bash
docker build -t strata-ds-api .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e API_KEY_HEADER=x-api-key \
  -e JWT_SECRET=your-secret \
  strata-ds-api
```

### Docker Compose

```bash
docker-compose up
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📦 Project Structure

```
api/
├── src/
│   ├── config/         # Configuration files
│   │   └── swagger.ts  # OpenAPI/Swagger config
│   ├── data/           # Data models and mock data
│   │   ├── foundations.ts
│   │   └── components.ts
│   ├── middleware/     # Express middleware
│   │   ├── auth.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── notFoundHandler.ts
│   ├── routes/         # API routes
│   │   ├── health.ts
│   │   ├── foundations.ts
│   │   ├── components.ts
│   │   └── search.ts
│   ├── utils/          # Utility functions
│   │   └── cache.ts
│   └── server.ts       # Main server file
├── dist/               # Compiled JavaScript (generated)
├── .env.example        # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# CORS
CORS_ORIGIN=http://localhost:5173

# Authentication
JWT_SECRET=your-super-secret-jwt-key
API_KEY_HEADER=x-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000      # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000

# Cache
CACHE_TTL_SECONDS=3600             # 1 hour
```

## 🚦 Rate Limiting

- **Standard**: 1000 requests per hour
- **Search**: 30 requests per minute (strict)
- **Enterprise**: Unlimited (contact sales)

Rate limits are applied per API key, not per IP.

## 📊 Caching

The API uses in-memory caching with node-cache:
- Default TTL: 1 hour (3600 seconds)
- Automatically refreshes on cache miss
- View cache stats at `/health` endpoint

For production with multiple instances, use Redis:
1. Install Redis client
2. Update `src/utils/cache.ts`
3. Set `REDIS_URL` in `.env`

## 🔐 Security

- **Helmet.js**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: Prevent abuse
- **JWT**: Token-based auth
- **API Keys**: Simple key-based auth

## 📈 Monitoring

Health check endpoint provides:
- API status
- Uptime
- Memory usage
- Cache statistics
- Environment info

```bash
curl http://localhost:3000/health
```

## 🚀 Deployment

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Connect your GitHub repo
2. Select "Web Service"
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

- Email: api@strata-ds.com
- Documentation: https://strata-ds.com/docs
- Issues: GitHub Issues

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Complete foundations API
- 12 AI-ready components
- Search functionality
- Swagger documentation
- Rate limiting
- Caching system
