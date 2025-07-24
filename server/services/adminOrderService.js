const Order = require('../models/orderModel'); // Adjust the path and model name accordingly
const moment = require('moment');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

/**
 * Service class to provide admin operations on orders.
 */
class AdminOrderService {
  /**
   * Get all orders with pagination, optional status filter, sorting
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Records per page
   * @param {string} status - Optional order status filter
   * @param {string} sortBy - Field to sort by (e.g., "createdAt")
   * @param {number} sortOrder - 1 for ascending, -1 for descending
   * @returns {Promise<Object>} Pagination result with orders, counts, and metadata
   */
  async getAllOrders(page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = -1) {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      orders,
      page,
      limit,
      totalPages,
      totalCount,
    };
  }

  /**
   * Get revenue statistics optionally filtered by date range.
   * @param {string} startDate - ISO date string for start date filter
   * @param {string} endDate - ISO date string for end date filter
   * @returns {Promise<Object>} Object containing total revenue and order count
   */
  async getRevenueStats(startDate, endDate) {
    const match = {};

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Example aggregation - adjust fields according to your schema
    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }, // Assuming 'total' field exists
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || { totalRevenue: 0, totalOrders: 0 };
  }

  /**
   * Get order statistics aggregated over a given time range (in days).
   * @param {number} timeRange - Number of days to look back
   * @returns {Promise<Object>} Object with daily order counts
   */
  async getOrderStats(timeRange = 30) {
    const fromDate = moment().subtract(timeRange, 'days').startOf('day').toDate();

    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stats;
  }

  /**
   * Get product order statistics with time range and limit.
   * Returns top products by order count or quantity.
   * @param {number} timeRange - Days to look back
   * @param {number} limit - Number of top products to return
   * @returns {Promise<Array>} Array of objects with productId, productName, count, totalQuantity
   */
  async getProductOrderStats(timeRange = 30, limit = 10) {
    const fromDate = moment().subtract(timeRange, 'days').startOf('day').toDate();

    // Assuming 'products' is an array field in the order document
    // Each product has productId, name, quantity, etc.
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.name' },
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: '$products.quantity' },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
    ]);

    return stats;
  }

  /**
   * Export orders in specified format with optional date range filter.
   * Supports CSV and JSON formats.
   * @param {string} format - Export format ('csv' or 'json')
   * @param {Object} dateRange - Optional object with start and end ISO date strings
   * @returns {Promise<{ data: Buffer|string, contentType: string }>} Export data and content-type header value
   */
  async exportOrders(format = 'csv', dateRange) {
    const filter = {};

    if (dateRange) {
      filter.createdAt = {};
      if (dateRange.start) filter.createdAt.$gte = new Date(dateRange.start);
      if (dateRange.end) filter.createdAt.$lte = new Date(dateRange.end);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    if (format === 'json') {
      const jsonData = JSON.stringify(orders, null, 2);
      return { data: jsonData, contentType: 'application/json' };
    }

    if (format === 'csv') {
      // Define CSV header fields (adjust according to your order schema)
      const csvStringifier = createCsvStringifier({
        header: [
          { id: '_id', title: 'Order ID' },
          { id: 'userId', title: 'User ID' },
          { id: 'status', title: 'Status' },
          { id: 'total', title: 'Total' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'updatedAt', title: 'Updated At' },
        ],
      });

      const records = orders.map(order => ({
        _id: order._id.toString(),
        userId: order.userId ? order.userId.toString() : '',
        status: order.status,
        total: order.total,
        createdAt: order.createdAt ? order.createdAt.toISOString() : '',
        updatedAt: order.updatedAt ? order.updatedAt.toISOString() : '',
      }));

      const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
      return { data: csvData, contentType: 'text/csv' };
    }

    throw new Error('Invalid export format. Supported formats: csv, json');
  }
}

module.exports = new AdminOrderService();
