const Order = require('../models/orderModel'); // make sure this points to your Order model
const { NotFoundError, ForbiddenError } = require('../utils/AppError');

class InvoiceService {
  /**
   * Generate an invoice object for an order
   * @param {string} orderId - MongoDB ObjectId of the order
   * @param {string} userId - Requesting user ID
   * @param {string} userRole - Requesting user role ('admin' or others)
   * @throws NotFoundError if order does not exist
   * @throws ForbiddenError if user unauthorized to access order
   * @returns {Object} Invoice data including order, customer, items, and pricing
   */
  async generateInvoice(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .populate('items.product', 'name price') // Ensure 'items.product' field path and select fields are correct
      .lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Authorization: only admins or the owner can access
    if (userRole !== 'admin' && order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to access this order');
    }

    // Defensive checks - shippingAddress and pricing should exist
    if (!order.shippingAddress) {
      throw new Error('Shipping address data is missing for the order');
    }
    if (!order.pricing) {
      throw new Error('Pricing data is missing for the order');
    }

    // Format invoice data
    return {
      orderNumber: order.orderId || order._id.toString(),
      date: order.createdAt,
      customer: {
        name: order.shippingAddress.fullName || '',
        address: order.shippingAddress.address || '',
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postalCode: order.shippingAddress.postalCode || '',
      },
      items: (order.items || []).map(item => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal: order.pricing.subtotal || 0,
      tax: order.pricing.tax || 0,
      shipping: order.pricing.shippingFee || 0,
      total: order.pricing.total || 0,
    };
  }
}

module.exports = new InvoiceService();
