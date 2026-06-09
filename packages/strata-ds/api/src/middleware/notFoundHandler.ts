import { Request, Response } from 'express';

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
      availableEndpoints: {
        foundations: '/v1/foundations',
        components: '/v1/components',
        search: '/v1/search',
        docs: '/api-docs',
        health: '/health'
      }
    }
  });
};
