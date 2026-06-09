import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getCache, setCache } from '../utils/cache';
import foundations from '../data/foundations';

const router = express.Router();

/**
 * @swagger
 * /foundations:
 *   get:
 *     summary: Get all foundations
 *     description: Retrieve all design system foundations (colors, typography, spacing, etc.)
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved foundations
 *       401:
 *         description: Unauthorized
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:all';
  let data = getCache(cacheKey);

  if (!data) {
    data = {
      colors: foundations.colors,
      typography: foundations.typography,
      spacing: foundations.spacing,
      borders: foundations.borders,
      shadows: foundations.shadows
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
 * /foundations/colors:
 *   get:
 *     summary: Get color palette
 *     description: Retrieve complete color system including Zinc scale, semantic colors, and data visualization palette
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved colors
 */
router.get('/colors', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:colors';
  let data = getCache(cacheKey);

  if (!data) {
    data = foundations.colors;
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /foundations/typography:
 *   get:
 *     summary: Get typography system
 *     description: Retrieve complete typography scale with font sizes, weights, and line heights
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved typography
 */
router.get('/typography', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:typography';
  let data = getCache(cacheKey);

  if (!data) {
    data = foundations.typography;
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /foundations/spacing:
 *   get:
 *     summary: Get spacing system
 *     description: Retrieve 8px-based spacing scale and grid system
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved spacing
 */
router.get('/spacing', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:spacing';
  let data = getCache(cacheKey);

  if (!data) {
    data = foundations.spacing;
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /foundations/borders:
 *   get:
 *     summary: Get border system
 *     description: Retrieve border radius, width, and style specifications
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved borders
 */
router.get('/borders', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:borders';
  let data = getCache(cacheKey);

  if (!data) {
    data = foundations.borders;
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

/**
 * @swagger
 * /foundations/shadows:
 *   get:
 *     summary: Get shadow system
 *     description: Retrieve elevation and shadow specifications
 *     tags: [Foundations]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved shadows
 */
router.get('/shadows', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'foundations:shadows';
  let data = getCache(cacheKey);

  if (!data) {
    data = foundations.shadows;
    setCache(cacheKey, data);
  }

  res.json({
    success: true,
    data
  });
}));

export default router;
