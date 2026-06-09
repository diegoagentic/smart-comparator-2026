import express, { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { getCache, setCache } from '../utils/cache';
import { searchComponents } from '../data/components';

const router = express.Router();

// Apply strict rate limiting to search
router.use(strictRateLimiter);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search across all components
 *     description: Search components by name, description, or category
 *     tags: [Search]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Maximum results to return
 *     responses:
 *       200:
 *         description: Successfully retrieved search results
 *       400:
 *         description: Missing or invalid query parameter
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '20' } = req.query;

  // Validate query parameter
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    throw createError(
      'Query parameter "q" is required and must not be empty',
      400,
      'INVALID_QUERY'
    );
  }

  const query = q.trim();
  const maxLimit = Math.min(parseInt(limit as string) || 20, 100);

  // Check cache
  const cacheKey = `search:${query}:${maxLimit}`;
  let results = getCache(cacheKey);

  if (!results) {
    // Perform search
    const allResults = searchComponents(query);
    results = allResults.slice(0, maxLimit);

    // Cache results
    setCache(cacheKey, results, 300); // Cache for 5 minutes
  }

  res.json({
    success: true,
    data: {
      query,
      total: results.length,
      results
    }
  });
}));

export default router;
