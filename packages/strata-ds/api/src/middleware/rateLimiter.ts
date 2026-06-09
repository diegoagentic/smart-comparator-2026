import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware
 * Standard: 1000 requests per hour
 * Enterprise: Can be customized per API key
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for certain conditions
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') {
      return true;
    }
    
    // Skip rate limiting for enterprise API keys (customize as needed)
    const apiKey = req.headers['x-api-key'] as string;
    const enterpriseKeys = ['strata_enterprise_key'];
    
    return enterpriseKeys.includes(apiKey);
  },
  // Custom key generator (can be used to rate limit per API key instead of IP)
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'] as string;
    
    // If API key exists, use it as the key
    if (apiKey) {
      return `apikey:${apiKey}`;
    }
    
    // Otherwise use IP address
    return req.ip || 'unknown';
  }
});

/**
 * Strict rate limiter for expensive operations (like search)
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many search requests, please slow down.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
