const Order = require('../models/orderModel');
const Message = require('../models/messageModel');

/**
 * Get the current status of an order
 * @param {string} orderId - The ID of the order
 * @returns {Promise<Object>} Order status information
 */
async function getOrderStatus(orderId) {
  try {
    const order = await Order.findById(orderId)
      .select('status trackingInfo estimatedDelivery lastUpdated')
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      orderId,
      status: order.status,
      trackingInfo: order.trackingInfo,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.lastUpdated || new Date()
    };
  } catch (error) {
    console.error('Error fetching order status:', error);
    throw error;
  }
}

/**
 * Store a chat message in the database
 * @param {string} senderId - The ID of the message sender
 * @param {string} recipientId - The ID of the message recipient
 * @param {string} content - The message content
 * @returns {Promise<Object>} Stored message
 */
async function storeMessage(senderId, recipientId, content) {
  try {
    const message = new Message({
      senderId,
      recipientId,
      content,
      timestamp: new Date(),
      status: 'delivered'
    });

    await message.save();
    return message.toObject();
  } catch (error) {
    console.error('Error storing message:', error);
    throw error;
  }
}

/**
 * Update order status and notify relevant clients
 * @param {Object} io - Socket.io instance
 * @param {string} orderId - The ID of the order
 * @param {string} status - New status
 * @param {Object} additionalInfo - Additional order information
 */
async function updateOrderStatus(io, orderId, status, additionalInfo = {}) {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...additionalInfo,
        lastUpdated: new Date()
      },
      { new: true }
    ).lean();

    if (!order) {
      throw new Error('Order not found');
    }

    // Notify all clients in the order room
    io.to(`order:${orderId}`).emit('order-status-update', {
      orderId,
      status: order.status,
      trackingInfo: order.trackingInfo,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.lastUpdated,
      ...additionalInfo
    });

    // Notify the order owner specifically
    io.to(`user:${order.userId}`).emit('order-update', {
      orderId,
      status: order.status,
      message: `Your order status has been updated to ${status}`
    });

    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

module.exports = {
  getOrderStatus,
  storeMessage,
  updateOrderStatus
};
