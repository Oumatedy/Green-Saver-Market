const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { NotFoundError, BadRequestError } = require('../utils/appError');
// const { NotFoundError, BadRequestError } = require('../utils/appError');

class OrderService {
  /**
   * Calculate order totals including subtotal, shipping, tax, and total
   * @param {Array} items - Array of order items with price and quantity
   * @param {number} shippingRate - Default shipping rate if subtotal below threshold
   * @param {number} taxRate - Tax rate as decimal (e.g. 0.08 for 8%)
   * @returns {Object} totals
   */
  calculateOrderTotals(items, shippingRate = 5.99, taxRate = 0.08) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 30 ? 0 : shippingRate; // Free shipping threshold
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Validate order items: check product existence, stock availability
   * Returns validated items with product/farmer info and errors array
   * @param {Array} items 
   * @returns {Object} validatedItems and errors
   */
  async validateOrderItems(items) {
    const validatedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        const product = await Product.findById(item.productId).populate('farmerId', 'name');

        if (!product) {
          errors.push(`Product not found: ${item.productId}`);
          continue;
        }

        if (!product.inStock || product.stock <= 0) {
          errors.push(`Product out of stock: ${product.name}`);
          continue;
        }

        if (product.stock < item.quantity) {
          errors.push(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
          continue;
        }

        validatedItems.push({
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          quantity: item.quantity,
          price: product.price,
          farmerId: product.farmerId && product.farmerId._id,
          farmerName: product.farmerId && product.farmerId.name,
        });
      } catch (error) {
        errors.push(`Error validating product ${item.productId}: ${error.message}`);
      }
    }

    return { validatedItems, errors };
  }

  /**
   * Update product stock after an order
   * @param {Array} items 
   * @param {'decrease'|'increase'} operation 
   * @returns {Array} stockUpdates with previous and new stock info
   */
  async updateProductStock(items, operation = 'decrease') {
    const stockUpdates = [];

    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);

        if (product) {
          const previousStock = product.stock;
          const newStock =
            operation === 'decrease'
              ? product.stock - item.quantity
              : product.stock + item.quantity;

          product.stock = Math.max(0, newStock);
          product.inStock = product.stock > 0;
          await product.save();

          stockUpdates.push({
            productId: item.productId,
            previousStock,
            newStock: product.stock,
            operation,
          });
        } else {
          // Log or handle product not found during stock update if needed
          console.warn(`Product not found for stock update: ${item.productId}`);
        }
      } catch (error) {
        console.error(`Error updating stock for product ${item.productId}:`, error);
      }
    }

    return stockUpdates;
  }

  /**
   * Generate a unique order ID string
   * Format: ORD-{timestamp}-{randomString}
   * @returns {string} orderId
   */
  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Aggregate order statistics with optional filters
   * @param {Object} filters (farmerId, startDate, endDate)
   * @returns {Object} aggregated stats
   */
  async getOrderStatistics(filters = {}) {
    const { farmerId, startDate, endDate } = filters;
    const matchStage = {};

    if (farmerId) {
      matchStage['items.farmerId'] = farmerId;
    }
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Aggregation pipeline to get stats including breakdown of status counts
    const [result] = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          statuses: { $push: '$status' },
        },
      },
      {
        $project: {
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          statusBreakdown: {
            $arrayToObject: {
              $map: {
                input: { $setUnion: ['$statuses'] },
                as: 'status',
                in: {
                  k: '$$status',
                  v: { $size: { $filter: { input: '$statuses', cond: { $eq: ['$$this', '$$status'] } } } },
                },
              },
            },
          },
        },
      },
    ]);
    return result || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      statusBreakdown: {},
    };
  }

  /**
   * Get orders aggregated by day or month in a date range
   * @param {string} startDate YYYY-MM-DD format
   * @param {string} endDate
   * @param {'day'|'month'} groupBy
   * @returns {Array} aggregation result with counts and revenue
   */
  async getOrdersByDateRange(startDate, endDate, groupBy = 'day') {
    if (!startDate || !endDate) {
      throw new BadRequestError('Start date and end date are required');
    }

    const groupId =
      groupBy === 'month'
        ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    return Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: groupId,
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
  }

  /**
   * Get top selling products within timeframe
   * @param {number} limit - number of products to return
   * @param {number} timeframe - days to look back
   * @returns {Array} product stats
   */
  async getTopSellingProducts(limit = 10, timeframe = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Send order notification placeholder
   * Implement integration with email/SMS/Push notification service
   * @param {string} orderId 
   * @param {string} type - notification type, e.g. 'orderCreated', 'orderShipped'
   * @param {Array} recipients - array of recipient emails or contacts
   */
  async sendOrderNotification(orderId, type, recipients = []) {
    // TODO: Integrate with real notification service (e.g. SendGrid, Twilio)
    console.log(`Sending ${type} notification for order ${orderId} to:`, recipients);

    return {
      success: true,
      type,
      orderId,
      recipients,
      sentAt: new Date(),
    };
  }

  /**
   * Get customer order history with pagination and summary
   * @param {string} userId 
   * @param {number} page 
   * @param {number} limit 
   */
  async getCustomerOrderHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total, summaryArr] = await Promise.all([
      Order.find({ userId })
        .populate('items.productId', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId }),
      Order.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
          },
        },
      ]),
    ]);

    const summary = summaryArr[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    };

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary,
    };
  }
}

module.exports = new OrderService();
