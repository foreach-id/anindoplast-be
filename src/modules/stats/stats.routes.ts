import { Router } from 'express';
import { StatsController } from './stats.controller';
import AuthMiddleware from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validateRequest';
import { statsSchemas } from './stats.schema';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all routes - requires authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]));

/**
 * GET /api/stats/dashboard
 * Get comprehensive dashboard statistics
 * Query params: startDate, endDate (optional)
 */
router.get('/dashboard', validate(statsSchemas.dateRange), StatsController.getDashboardStats);

/**
 * GET /api/stats/sales
 * Get detailed sales statistics
 * Query params: startDate, endDate (optional)
 */
router.get('/sales', validate(statsSchemas.dateRange), StatsController.getSalesStats);

/**
 * GET /api/stats/products
 * Get product performance statistics
 */
router.get('/products', StatsController.getProductStats);

/**
 * GET /api/stats/customers
 * Get customer insights and statistics
 */
router.get('/customers', StatsController.getCustomerStats);

/**
 * GET /api/stats/orders
 * Get order patterns and statistics
 * Query params: startDate, endDate (optional)
 */
router.get('/orders', validate(statsSchemas.dateRange), StatsController.getOrderStats);

export const statsRoutes = router;