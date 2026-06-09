import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { apiKeyAuth } from './middleware/auth';

// Routes
import foundationsRouter from './routes/foundations';
import componentsRouter from './routes/components';
import searchRouter from './routes/search';
import healthRouter from './routes/health';
import webhooksRouter from './routes/webhooks';
import versionsRouter from './routes/versions';
import notificationsRouter from './routes/notifications';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// ==========================================
// Middleware
// ==========================================

// Security
app.use(helmet());

// CORS
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting (apply to all API routes)
app.use(`/${API_VERSION}`, rateLimiter);

// ==========================================
// Routes
// ==========================================

// Health check (no auth required)
app.use('/health', healthRouter);

// API Documentation (no auth required)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes (auth required)
app.use(`/${API_VERSION}/foundations`, apiKeyAuth, foundationsRouter);
app.use(`/${API_VERSION}/components`, apiKeyAuth, componentsRouter);
app.use(`/${API_VERSION}/search`, apiKeyAuth, searchRouter);

// Webhooks (auth required with webhook signature validation)
app.use(`/${API_VERSION}/webhooks`, webhooksRouter);

// Versions (public read, auth required for write)
app.use(`/${API_VERSION}/versions`, versionsRouter);

// Notifications
app.use(`/${API_VERSION}/notifications`, apiKeyAuth, notificationsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Strata DS API',
    version: API_VERSION,
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      foundations: `/${API_VERSION}/foundations`,
      components: `/${API_VERSION}/components`,
      search: `/${API_VERSION}/search`,
      webhooks: `/${API_VERSION}/webhooks`,
      versions: `/${API_VERSION}/versions`,
      notifications: `/${API_VERSION}/notifications`
    }
  });
});

// ==========================================
// Error Handling
// ==========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==========================================
// Server
// ==========================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 Strata DS API Server                                ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                   ║
║   Port:        ${PORT}                                       ║
║   Version:     ${API_VERSION}                                          ║
║                                                           ║
║   🔗 Endpoints:                                          ║
║   - API Docs:     http://localhost:${PORT}/api-docs       ║
║   - Health:       http://localhost:${PORT}/health         ║
║   - Foundations:  http://localhost:${PORT}/${API_VERSION}/foundations   ║
║   - Components:   http://localhost:${PORT}/${API_VERSION}/components    ║
║   - Search:       http://localhost:${PORT}/${API_VERSION}/search        ║
║   - Webhooks:     http://localhost:${PORT}/${API_VERSION}/webhooks      ║
║   - Versions:     http://localhost:${PORT}/${API_VERSION}/versions      ║
║   - Notifications:http://localhost:${PORT}/${API_VERSION}/notifications ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;