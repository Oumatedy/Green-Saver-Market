const Payment = require('../models/paymentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createPaymentIntent(amount) {
    return await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
  }

  async createPayment(paymentData) {
    return await Payment.create(paymentData);
  }

  async getPaymentByOrderId(orderId) {
    return await Payment.findOne({ orderId });
  }

  async updatePaymentStatus(paymentId, status) {
    return await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
  }
}

module.exports = new PaymentService();
