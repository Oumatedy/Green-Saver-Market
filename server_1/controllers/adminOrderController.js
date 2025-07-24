const adminOrderService = require('../services/adminOrderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller for admin-specific order operations
 */
class AdminOrderController {
  /**
   * Get all orders with pagination, sorting, and filtering
   */
  getAllOrders = asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = -1 
    } = req.query;

    const result = await adminOrderService.getAllOrders(
      page,
      limit,
      status,
      sortBy,
      sortOrder
    );
    
    ApiResponse.success(result, 'Orders retrieved successfully').send(res);
  });

  /**
   * Get revenue statistics with optional date range
   */
  getRevenueStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await adminOrderService.getRevenueStats(startDate, endDate);
    ApiResponse.success(stats, 'Revenue statistics retrieved successfully').send(res);
  });

  /**
   * Get order statistics with configurable time range
   */
  getOrderStats = asyncHandler(async (req, res) => {
    const { timeRange = 30 } = req.query;
    const stats = await adminOrderService.getOrderStats(timeRange);
    ApiResponse.success(stats, 'Order statistics retrieved successfully').send(res);
  });

  /**
   * Get product order statistics with configurable parameters
   */
  getProductOrderStats = asyncHandler(async (req, res) => {
    const { timeRange = 30, limit = 10 } = req.query;
    const stats = await adminOrderService.getProductOrderStats(timeRange, limit);
    ApiResponse.success(stats, 'Product order statistics retrieved successfully').send(res);
  });

  /**
   * Export orders in specified format with optional date range
   */
  exportOrders = asyncHandler(async (req, res) => {
    const { format, dateRange } = req.body;
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
