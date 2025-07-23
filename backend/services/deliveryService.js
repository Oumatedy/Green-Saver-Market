class DeliveryService {
  getAvailableSlots() {
    const today = new Date();
    const slots = [];
    
    // Generate slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Only create slots for weekdays
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        slots.push({
          date: date.toISOString().split('T')[0],
          slots: ['09:00-12:00', '13:00-16:00', '17:00-20:00']
        });
      }
    }
    
    return slots;
  }

  async getDeliveryStats() {
    const stats = await Order.aggregate([
      {
        $match: {
          deliveryMethod: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$deliveryMethod',
          count: { $sum: 1 },
          averageDeliveryTime: {
            $avg: {
              $subtract: ['$deliveredAt', '$createdAt']
            }
          }
        }
      }
    ]);

    return stats;
  }

  async getOrderTracking(orderId, userId, userRole) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'admin' && order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to track this order');
    }

    return {
      status: order.status,
      statusHistory: order.statusHistory,
      deliverySlot: order.deliverySlot,
      estimatedDelivery: order.deliverySlot?.date
    };
  }
}

module.exports = new DeliveryService();
