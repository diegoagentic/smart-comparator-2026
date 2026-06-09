import express, { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { getCache, setCache } from '../utils/cache';
import {
  components,
  getComponentById,
  getComponentsByCategory,
  getComponentsByStatus
} from '../data/components';

const router = express.Router();

/**
 * @swagger
 * /components:
 *   get:
 *     summary: Get all components
 *     description: Retrieve list of all components with optional filtering
 *     tags: [Components]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ai-ready, in-progress, special]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successfully retrieved components
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { category, status } = req.query;
  
  let data = components;
  let cacheKey = 'components:all';

  // Filter by category
  if (category) {
    cacheKey = `components:category:${category}`;
    let cached = getCache(cacheKey);
    
    if (!cached) {
      cached = getComponentsByCategory(category as string);
      setCache(cacheKey, cached);
    }
    data = cached;
  }

  // Filter by status
  if (status) {
    cacheKey = `components:status:${status}`;
    let cached = getCache(cacheKey);
    
    if (!cached) {
      cached = getComponentsByStatus(status as string);
      setCache(cacheKey, cached);
    }
    data = cached;
  }

  // If no filters, use cached all components
  if (!category && !status) {
    let cached = getCache(cacheKey);
    if (!cached) {
      setCache(cacheKey, components);
      cached = components;
    }
    data = cached;
  }

  // Calculate stats
  const stats = {
    total: components.length,
    aiReady: components.filter(c => c.status === 'ai-ready').length,
    inProgress: components.filter(c => c.status === 'in-progress').length,
    special: components.filter(c => c.status === 'special').length
  };

  res.json({
    success: true,
    data: {
      stats,
      components: data
    }
  });
}));

/**
 * @swagger
 * /components/{id}:
 *   get:
 *     summary: Get component by ID
 *     description: Retrieve complete component data including code examples
 *     tags: [Components]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Component ID
 *     responses:
 *       200:
 *         description: Successfully retrieved component
 *       404:
 *         description: Component not found
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `component:${id}`;
  
  let data = getCache(cacheKey);

  if (!data) {
    data = getComponentById(id);
    
    if (!data) {
      throw createError(`Component '${id}' not found`, 404, 'COMPONENT_NOT_FOUND');
    }
    
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /components/{id}/code/{format}:
 *   get:
 *     summary: Get component code in specific format
 *     description: Retrieve component code in React, HTML, CSS, or AI Prompt format
 *     tags: [Components]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Component ID
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [react, html, css, ai-prompt]
 *         description: Code format
 *     responses:
 *       200:
 *         description: Successfully retrieved code
 *       404:
 *         description: Component or code format not found
 */
router.get('/:id/code/:format', asyncHandler(async (req: Request, res: Response) => {
  const { id, format } = req.params;
  const cacheKey = `component:${id}:code:${format}`;
  
  let data = getCache(cacheKey);

  if (!data) {
    const component = getComponentById(id);
    
    if (!component) {
      throw createError(`Component '${id}' not found`, 404, 'COMPONENT_NOT_FOUND');
    }

    if (!component.code) {
      throw createError(
        `Code examples not available for component '${id}'`,
        404,
        'CODE_NOT_AVAILABLE'
      );
    }

    const formatMap: Record<string, keyof typeof component.code> = {
      'react': 'react',
      'html': 'html',
      'css': 'css',
      'ai-prompt': 'aiPrompt'
    };

    const codeKey = formatMap[format];

    if (!codeKey || !component.code[codeKey]) {
      throw createError(
        `Format '${format}' not available. Valid formats: react, html, css, ai-prompt`,
        400,
        'INVALID_FORMAT'
      );
    }

    data = {
      componentId: id,
      componentName: component.name,
      format,
      code: component.code[codeKey]
    };

    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /components/{id}/tokens:
 *   get:
 *     summary: Get component design tokens
 *     description: Retrieve design tokens for a specific component
 *     tags: [Components]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Component ID
 *     responses:
 *       200:
 *         description: Successfully retrieved tokens
 *       404:
 *         description: Component or tokens not found
 */
router.get('/:id/tokens', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `component:${id}:tokens`;
  
  let data = getCache(cacheKey);

  if (!data) {
    const component = getComponentById(id);
    
    if (!component) {
      throw createError(`Component '${id}' not found`, 404, 'COMPONENT_NOT_FOUND');
    }

    if (!component.tokens) {
      throw createError(
        `Tokens not available for component '${id}'`,
        404,
        'TOKENS_NOT_AVAILABLE'
      );
    }

    data = {
      componentId: id,
      componentName: component.name,
      tokens: component.tokens
    };

    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

export default router;
