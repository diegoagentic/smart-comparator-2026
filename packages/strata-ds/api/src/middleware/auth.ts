import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Valid API keys (in production, store these in a database)
const VALID_API_KEYS = new Set([
  'strata_test_key_12345',
  'strata_demo_key_67890',
  // Add more keys as needed
]);

/**
 * API Key Authentication Middleware
 * Validates API key from header
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers.authorization;

  // Check API key
  if (apiKey && VALID_API_KEYS.has(apiKey)) {
    return next();
  }

  // Check Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      req.user = decoded;
      return next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
      return;
    }
  }

  // No valid authentication provided
  res.status(401).json({
    success: false,
    error: {
      message: 'Authentication required. Please provide a valid API key or Bearer token.',
      code: 'UNAUTHORIZED',
      details: {
        'x-api-key': 'Provide API key in header',
        'Authorization': 'Or provide Bearer token in header'
      }
    }
  });
};

/**
 * Optional authentication - allows both authenticated and unauthenticated access
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers.authorization;

  if (apiKey && VALID_API_KEYS.has(apiKey)) {
    req.user = { apiKey: true };
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      req.user = decoded;
    } catch (error) {
      // Invalid token, but we allow unauthenticated access
    }
  }

  next();
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '7d'
  });
};
