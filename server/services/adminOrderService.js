const Order = require('../models/orderModel');
const { BadRequestError } = require('../utils/AppError');

/**
 * Service class for handling admin-specific order operations
 */
class AdminOrderService {
  async getAllOrders(page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = -1) {
    // Validate sort order
    const validSortOrders = [-1, 1];
    if (!validSortOrders.includes(parseInt(sortOrder))) {
      throw new BadRequestError('Invalid sort order. Must be 1 or -1');
    }

    // Validate sortBy field
    const validSortFields = ['createdAt', 'total', 'status', 'orderId'];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestError(`Invalid sort field. Must be one of: ${validSortFields.join(', ')}`);
    }

    const filter = {};
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name price')
      .populate('userId', 'name email')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getRevenueStats() {
    const stats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    return stats;
  }

  async getOrderStats(timeRange = 30) {
    // Validate time range
    if (isNaN(timeRange) || timeRange < 1 || timeRange > 365) {
      throw new BadRequestError('Time range must be between 1 and 365 days');
    }

    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - timeRange);

    try {
      const [
        statusStats,
        totalOrders,
        recentOrders,
        revenueStats,
        dailyStats
      ] = await Promise.all([
        // Status distribution with percentage
        Order.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$count' },
              statuses: { $push: { status: '$_id', count: '$count' } }
            }
          },
          {
            $project: {
              _id: 0,
              statuses: {
                $map: {
                  input: '$statuses',
                  as: 'status',
                  in: {
                    status: '$$status.status',
                    count: '$$status.count',
                    percentage: {
                      $multiply: [{ $divide: ['$$status.count', '$total'] }, 100]
                    }
                  }
                }
              }
            }
          }
        ]),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: dateRange } }),
        // Comprehensive revenue statistics
        Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              averageOrderValue: { $avg: '$total' },
              minOrderValue: { $min: '$total' },
              maxOrderValue: { $max: '$total' },
              totalItems: { $sum: { $size: '$items' } }
            }
          }
        ]),
        // Daily stats with growth rates
        Order.aggregate([
          {
            $match: { createdAt: { $gte: dateRange } }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
              averageOrderValue: { $avg: '$total' },
              itemsSold: { $sum: { $size: '$items' } }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          }
        ])
      ]);

      // Process and return statistics
      return {
        totalOrders,
        recentOrders,
        revenueStats: {
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          averageOrderValue: revenueStats[0]?.averageOrderValue || 0,
          minOrderValue: revenueStats[0]?.minOrderValue || 0,
          maxOrderValue: revenueStats[0]?.maxOrderValue || 0,
          totalItems: revenueStats[0]?.totalItems || 0
        },
        statusDistribution: statusStats[0]?.statuses || [],
        dailyTrend: dailyStats.map(stat => ({
          date: `${stat._id.year}-${stat._id.month}-${stat._id.day}`,
          revenue: stat.revenue,
          orders: stat.orders,
          averageOrderValue: stat.averageOrderValue,
          itemsSold: stat.itemsSold
        }))
      };
    } catch (error) {
      throw new Error(`Error calculating order statistics: ${error.message}`);
    }
  }

  async getProductOrderStats(timeRange = 30, limit = 10) {
    try {
      // Validate parameters
      if (isNaN(timeRange) || timeRange < 1 || timeRange > 365) {
        throw new BadRequestError('Time range must be between 1 and 365 days');
      }
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new BadRequestError('Limit must be between 1 and 100');
      }

      const dateRange = new Date();
      dateRange.setDate(dateRange.getDate() - timeRange);

      const stats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange },
            status: { $in: ['completed', 'delivered'] }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.product',
            totalOrders: { $sum: 1 },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] }
            },
            uniqueCustomers: { $addToSet: '$userId' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            productName: '$product.name',
            productImage: '$product.image',
            category: '$product.category',
            totalOrders: 1,
            totalQuantity: 1,
            totalRevenue: 1,
            uniqueCustomers: { $size: '$uniqueCustomers' },
            averageOrderValue: {
              $divide: ['$totalRevenue', '$totalOrders']
            },
            revenuePerItem: {
              $divide: ['$totalRevenue', '$totalQuantity']
            }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: limit
        }
      ]);

      // Calculate growth rates if possible (requires previous period data)
      const previousDateRange = new Date(dateRange);
      previousDateRange.setDate(previousDateRange.getDate() - timeRange);

      const previousStats = await Order.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: previousDateRange,
              $lt: dateRange
            },
            status: { $in: ['completed', 'delivered'] }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.product',
            previousRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] }
            }
          }
        }
      ]);

      // Create lookup table for previous stats
      const previousStatsMap = previousStats.reduce((acc, stat) => {
        acc[stat._id.toString()] = stat.previousRevenue;
        return acc;
      }, {});

      // Add growth rates to the stats
      const enrichedStats = stats.map(stat => ({
        ...stat,
        growthRate: previousStatsMap[stat._id.toString()]
          ? ((stat.totalRevenue - previousStatsMap[stat._id.toString()]) / previousStatsMap[stat._id.toString()]) * 100
          : null
      }));

      return enrichedStats;
    } catch (error) {
      throw new Error(`Error calculating product order statistics: ${error.message}`);
    }
  }

  async exportOrders(format, dateRange) {
    // Validate format
    if (!format) {
      throw new BadRequestError('Export format is required');
    }

    const validFormats = ['csv', 'json'];
    if (!validFormats.includes(format.toLowerCase())) {
      throw new BadRequestError(`Invalid export format. Must be one of: ${validFormats.join(', ')}`);
    }

    // Validate and process date range
    const filter = {};
    if (dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Invalid date range format');
      }

      if (end < start) {
        throw new BadRequestError('End date must be after start date');
      }

      filter.createdAt = { $gte: start, $lte: end };
    }

    // Fetch orders with necessary populated fields
    const orders = await Order.find(filter)
      .populate('items.product', 'name price')
      .populate('userId', 'name email')
      .lean();

    if (format.toLowerCase() === 'csv') {
      const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Items', 'Total'];
      const rows = orders.map(order => [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        order.userId?.email || 'N/A',
        order.status,
        order.items.length,
        order.total.toFixed(2)
      ]);

      return {
        data: [headers, ...rows].map(row => row.join(',')).join('\n'),
        contentType: 'text/csv'
      };
    } 

    // Format JSON response
    const formattedOrders = orders.map(order => ({
      orderId: order.orderId,
      date: order.createdAt,
      customer: {
        id: order.userId?._id,
        email: order.userId?.email
      },
      status: order.status,
      items: order.items.map(item => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total
    }));

    return {
      data: JSON.stringify(formattedOrders, null, 2),
      contentType: 'application/json'
    };
  }
}

module.exports = new AdminOrderService();
