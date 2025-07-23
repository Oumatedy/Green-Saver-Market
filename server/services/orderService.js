const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

class OrderService {
  // Calculate order totals
  calculateOrderTotals(items, shippingRate = 5.99, taxRate = 0.08) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 30 ? 0 : shippingRate; // Free shipping over $30
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  // Validate order items and check stock
  async validateOrderItems(items) {
    const validatedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        const product = await Product.findById(item.productId)
          .populate('farmerId', 'name');

        if (!product) {
          errors.push(`Product not found: ${item.productId}`);
          continue;
        }

        if (!product.inStock) {
          errors.push(`Product out of stock: ${product.name}`);
          continue;
        }

        if (product.stock < item.quantity) {
          errors.push(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
          continue;
        }

        validatedItems.push({
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          quantity: item.quantity,
          price: product.price,
          farmerId: product.farmerId._id,
          farmerName: product.farmerId.name
        });
      } catch (error) {
        errors.push(`Error validating product ${item.productId}: ${error.message}`);
      }
    }

    return { validatedItems, errors };
  }

  // Update product stock after order
  async updateProductStock(items, operation = 'decrease') {
    const stockUpdates = [];

    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          const newStock = operation === 'decrease' 
            ? product.stock - item.quantity
            : product.stock + item.quantity;

          product.stock = Math.max(0, newStock);
          product.inStock = product.stock > 0;
          await product.save();

          stockUpdates.push({
            productId: item.productId,
            previousStock: operation === 'decrease' ? product.stock + item.quantity : product.stock - item.quantity,
            newStock: product.stock,
            operation
          });
        }
      } catch (error) {
        console.error(`Error updating stock for product ${item.productId}:`, error);
      }
    }

    return stockUpdates;
  }

  // Generate unique order ID
  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${randomStr}`.toUpperCase();
  }

  // Get order statistics
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

    return Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          statusBreakdown: {
            $push: '$status'
          }
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          statusBreakdown: {
            $reduce: {
              input: '$statusBreakdown',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{ k: '$$this', v: { $add: [{ $ifNull: [`$$value.$$this`, 0] }, 1] } }]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);
  }

  // Get orders by date range with aggregation
  async getOrdersByDateRange(startDate, endDate, groupBy = 'day') {
    const formatDate = groupBy === 'month' 
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

    return Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: formatDate,
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
  }

  // Get top selling products
  async getTopSellingProducts(limit = 10, timeframe = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'preparing', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);
  }

  // Send order notifications (placeholder for real implementation)
  async sendOrderNotification(orderId, type, recipients = []) {
    // In a real application, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending ${type} notification for order ${orderId} to:`, recipients);
    
    // Return notification status
    return {
      success: true,
      type,
      orderId,
      recipients,
      sentAt: new Date()
    };
  }

  // Get customer order history with summary
  async getCustomerOrderHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total, summary] = await Promise.all([
      Order.find({ userId })
        .populate('items.productId', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      
      Order.countDocuments({ userId }),
      
      Order.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ])
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summary[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 }
    };
  }
}

module.exports = new OrderService();