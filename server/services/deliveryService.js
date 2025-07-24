const Order = require('../models/orderModel'); // Adjust path as needed
const { NotFoundError, ForbiddenError } = require('../utils/AppError');

class DeliveryService {
  constructor() {
    // Define default delivery slots per weekday; can be made configurable later
    this.defaultSlots = ['09:00-12:00', '13:00-16:00', '17:00-20:00'];
    this.daysAhead = 7; // Number of days to generate slots for
  }

  /**
   * Get available delivery slots for the next [daysAhead] weekdays (Mon-Fri).
   * @returns {Array} Array of objects with date and available slots
   */
  getAvailableSlots() {
    const today = new Date();
    const slots = [];

    for (let i = 1; i <= this.daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      slots.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        slots: [...this.defaultSlots], // clone to prevent mutation
      });
    }

    return slots;
  }

  /**
   * Get aggregated delivery statistics grouped by delivery method.
   * Includes count and average delivery time in milliseconds and hours.
   * @returns {Promise<Array>} Statistics per delivery method
   */
  async getDeliveryStats() {
    const stats = await Order.aggregate([
      {
        $match: {
          deliveryMethod: { $exists: true, $ne: null },
          deliveredAt: { $exists: true, $ne: null },
          createdAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$deliveryMethod',
          count: { $sum: 1 },
          averageDeliveryTimeMs: {
            $avg: { $subtract: ['$deliveredAt', '$createdAt'] },
          },
        },
      },
    ]);

    // Convert average time in ms to fixed hours for easier front-end consumption
    return stats.map(stat => ({
      deliveryMethod: stat._id,
      count: stat.count,
      averageDeliveryTimeMs: stat.averageDeliveryTimeMs,
      averageDeliveryTimeHours: (stat.averageDeliveryTimeMs / 3600000).toFixed(2),
    }));
  }

  /**
   * Get delivery tracking info for a specific order.
   * Access is limited to admins or the order owner.
   * @param {string} orderId - MongoDB ObjectId of the order
   * @param {string} userId - Requesting user's ID
   * @param {string} userRole - Requesting user's role
   * @throws {NotFoundError} if order not found
   * @throws {ForbiddenError} if user is unauthorized
   * @returns {Promise<Object>} Object containing tracking details
   */
  async getOrderTracking(orderId, userId, userRole) {
    const order = await Order.findById(orderId).lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'admin' && order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to track this order');
    }

    return {
      status: order.status,
      statusHistory: order.statusHistory || [],
      deliverySlot: order.deliverySlot || null,
      estimatedDelivery: order.deliverySlot?.date || null,
    };
  }
}

module.exports = new DeliveryService();
