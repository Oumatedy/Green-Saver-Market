const Payment = require('../models/paymentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { NotFoundError, BadRequestError } = require('../utils/AppError');

class PaymentService {
  /**
   * Create a Stripe Payment Intent
   * @param {number} amount - Amount in smallest currency unit (e.g., cents)
   * @param {string} currency - Currency code (default: 'usd')
   * @returns {Promise<Object>} Stripe PaymentIntent object
   */
  async createPaymentIntent(amount, currency = 'usd') {
    if (!amount || amount <= 0) {
      throw new BadRequestError('Amount must be a positive number');
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    return intent;
  }

  /**
   * Create a new Payment document in MongoDB
   * @param {Object} paymentData - Payment details to save
   * @returns {Promise<Object>} Created payment document
   */
  async createPayment(paymentData) {
    return await Payment.create(paymentData);
  }

  /**
   * Get a payment record by its associated order ID
   * @param {string} orderId - MongoDB ObjectId of the order
   * @returns {Promise<Object|null>} Found payment document or null
   */
  async getPaymentByOrderId(orderId) {
    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }

    const payment = await Payment.findOne({ orderId });
    return payment;
  }

  /**
   * Update the status of a payment by payment ID
   * @param {string} paymentId - MongoDB ObjectId of the payment
   * @param {string} status - New payment status (e.g., 'succeeded', 'failed')
   * @returns {Promise<Object>} Updated payment document
   */
  async updatePaymentStatus(paymentId, status) {
    if (!paymentId || !status) {
      throw new BadRequestError('Payment ID and status are required');
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    payment.status = status;
    await payment.save();

    return payment;
  }
}

module.exports = new PaymentService();
