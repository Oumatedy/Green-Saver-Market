const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();

const adminOrderController = require('../controllers/AdminOrderController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// Apply authentication and admin-only middleware to all admin order routes
router.use(authMiddleware, adminOnly);

/**
 * GET /api/v1/admin/orders
 * Get all orders with pagination, filtering, and sorting
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('status').optional().isString().withMessage('Status filter must be a string'),
    query('sortBy').optional().isString().withMessage('Sort field must be a string'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', '1', '-1'])
      .withMessage('Sort order must be one of asc, desc, 1, or -1'),
  ],
  validate(),
  adminOrderController.getAllOrders
);

/**
 * GET /api/v1/admin/orders/revenue-stats
 * Get revenue statistics for specified date range
 */
router.get(
  '/revenue-stats',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be ISO8601 date'),
  ],
  validate(),
  adminOrderController.getRevenueStats
);

/**
 * GET /api/v1/admin/orders/order-stats
 * Get order statistics for a time range (default 30 days)
 */
router.get(
  '/order-stats',
  [
    query('timeRange')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Time range must be a positive integer'),
  ],
  validate(),
  adminOrderController.getOrderStats
);

/**
 * GET /api/v1/admin/orders/product-order-stats
 * Get product order statistics with configurable time range and limit
 */
router.get(
  '/product-order-stats',
  [
    query('timeRange')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Time range must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Limit must be a positive integer'),
  ],
  validate(),
  adminOrderController.getProductOrderStats
);

/**
 * POST /api/v1/admin/orders/export
 * Export orders in specified format and optional date range
 */
router.post(
  '/export',
  [
    body('format')
      .notEmpty()
      .withMessage('Export format is required')
      .isIn(['csv', 'json'])
      .withMessage('Format must be csv or json'),
    body('dateRange.start')
      .optional()
      .isISO8601()
      .withMessage('Start date must be ISO8601'),
    body('dateRange.end')
      .optional()
      .isISO8601()
      .withMessage('End date must be ISO8601'),
  ],
  validate(),
  adminOrderController.exportOrders
);

module.exports = router;
