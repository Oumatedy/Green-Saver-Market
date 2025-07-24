const { NotFoundError, ForbiddenError } = require('../utils/AppError');

class InvoiceService {
  async generateInvoice(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .populate('items.product', 'name price');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userRole !== 'admin' && order.user !== userId) {
      throw new ForbiddenError('Not authorized to access this order');
    }

    return {
      orderNumber: order.orderId,
      date: order.createdAt,
      customer: {
        name: order.shippingAddress.fullName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode
      },
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      subtotal: order.pricing.subtotal,
      tax: order.pricing.tax,
      shipping: order.pricing.shippingFee,
      total: order.pricing.total
    };
  }
}

module.exports = new InvoiceService();
