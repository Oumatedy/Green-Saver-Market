const adminOrderService = require('../services/adminOrderService');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');

class AdminOrderController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get all orders with pagination, sorting, and filtering
   * GET /api/v1/admin/orders
   */
  getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status || undefined;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrderRaw = req.query.sortOrder;
    // Convert sortOrder to 1 or -1; default -1 (descending)
    const sortOrder = sortOrderRaw === 'asc' || sortOrderRaw === '1' ? 1 : -1;

    const result = await adminOrderService.getAllOrders(page, limit, status, sortBy, sortOrder);
    this.ok(res, result);
  });

  /**
   * Get revenue statistics with optional date range
   * GET /api/v1/admin/orders/revenue-stats
   */
  getRevenueStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Optionally validate date formats if desired

    const stats = await adminOrderService.getRevenueStats(startDate, endDate);
    this.ok(res, stats);
  });

  /**
   * Get order statistics with configurable time range
   * GET /api/v1/admin/orders/order-stats
   */
  getOrderStats = asyncHandler(async (req, res) => {
    const timeRange = parseInt(req.query.timeRange, 10) || 30; // default 30 days
    const stats = await adminOrderService.getOrderStats(timeRange);
    this.ok(res, stats);
  });

  /**
   * Get product order statistics with configurable parameters
   * GET /api/v1/admin/orders/product-order-stats
   */
  getProductOrderStats = asyncHandler(async (req, res) => {
    const timeRange = parseInt(req.query.timeRange, 10) || 30;
    const limit = parseInt(req.query.limit, 10) || 10;
    const stats = await adminOrderService.getProductOrderStats(timeRange, limit);
    this.ok(res, stats);
  });

  /**
   * Export orders in specified format with optional date range
   * POST /api/v1/admin/orders/export
   */
  exportOrders = asyncHandler(async (req, res) => {
    const { format = 'csv', dateRange } = req.body;

    const { data, contentType } = await adminOrderService.exportOrders(format, dateRange);

    const filename = `orders-${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    res.send(data);
  });
}

module.exports = new AdminOrderController();
