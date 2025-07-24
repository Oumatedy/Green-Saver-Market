// server/controllers/PaymentController.js

const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const { validationResult } = require('express-validator');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');

/**
 * PaymentController handles all payment related operations.
 * It extends BaseController for response helpers.
 * Methods are class arrow functions wrapped with asyncHandler
 * for error handling and 'this' context binding.
 */
class PaymentController extends BaseController {
  constructor() {
    super();
  }

  getPaymentMethods = asyncHandler(async (req, res) => {
    const methods = ['card', 'bank_transfer', 'cash', 'mobile_money'];
    this.ok(res, { methods });
  });

  addPaymentMethod = asyncHandler(async (req, res) => {
    // TODO: Implement actual logic to add a payment method
    this.created(res, { message: 'Payment method added' });
  });

  removePaymentMethod = asyncHandler(async (req, res) => {
    // TODO: Implement actual logic to remove a payment method
    this.ok(res, { message: 'Payment method removed' });
  });

  createPayment = asyncHandler(async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return this.clientError(res, 'Validation errors', result.array());
    }

    const { orderId, paymentMethod, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return this.notFound(res, 'Order not found');

    if (order.user.toString() !== req.user.userId) {
      return this.forbidden(res, 'Not authorized to pay for this order');
    }

    if (Math.abs(amount - order.pricing.total) > 0.01) {
      return this.clientError(res, 'Payment amount does not match order total');
    }

    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

    const paymentData = {
      paymentId,
      orderId: order._id,
      userId: req.user.userId,
      amount,
      paymentMethod,
      status: 'pending',
      transactionData: {
        paymentIntentId: `pi_${Math.random().toString(36).substring(2)}`,
        processorResponse: null,
      },
    };

    const payment = new Payment(paymentData);
    await payment.save();

    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.transactionData.processorResponse = {
          transactionId: `txn_${Math.random().toString(36).substring(2)}`,
          processedAt: new Date(),
          paymentProcessor: 'stripe',
        };
        payment.processedAt = new Date();
        await payment.save();

        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        await order.save();
      } catch (err) {
        console.error('Error processing simulated payment:', err);
      }
    }, 2000);

    this.created(res, { paymentId }, 'Payment initiated');
  });

  getPayment = asyncHandler(async (req, res) => {
    // TODO: implement getting single payment by paymentId
    this.ok(res, { message: 'Get payment - not yet implemented' });
  });

  getPaymentStatus = asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId })
      .populate('orderId', 'orderId pricing.total')
      .populate('userId', 'name email');
    if (!payment) return this.notFound(res, 'Payment not found');

    if (req.user.role !== 'admin' && payment.userId._id.toString() !== req.user.userId) {
      return this.forbidden(res, 'Not authorized to view this payment');
    }

    this.ok(res, payment);
  });

  verifyPayment = asyncHandler(async (req, res) => {
    // TODO: implement payment verification logic
    this.ok(res, { message: 'Verify payment - not yet implemented' });
  });

  capturePayment = asyncHandler(async (req, res) => {
    // TODO: implement payment capture logic
    this.ok(res, { message: 'Capture payment - not yet implemented' });
  });

  getPaymentHistory = asyncHandler(async (req, res) => {
    // TODO: implement customer payment history retrieval
    this.ok(res, { message: 'Payment history - not yet implemented' });
  });

  downloadPaymentHistory = asyncHandler(async (req, res) => {
    // TODO: implement export payment history functionality
    this.ok(res, { message: 'Download payment history - not yet implemented' });
  });

  processRefund = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to process refunds');
    }
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return this.clientError(res, 'Validation errors', result.array());
    }
    const { amount, reason } = req.body;
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });
    if (!payment) return this.notFound(res, 'Payment not found');
    if (payment.status !== 'completed') {
      return this.clientError(res, 'Can only refund completed payments');
    }
    if (amount > payment.amount) {
      return this.clientError(res, 'Refund amount cannot exceed payment amount');
    }
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.refundedBy = req.user.userId;
    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      order.status = 'cancelled';
      order.paymentStatus = 'refunded';
      await order.save();
    }

    this.ok(res, {
      message: 'Refund processed successfully',
      payment,
    });
  });

  getRefundStatus = asyncHandler(async (req, res) => {
    // TODO: implement refund status retrieval
    this.ok(res, { message: 'Refund status - not yet implemented' });
  });

  getAllPayments = asyncHandler(async (req, res) => {
    // TODO: implement admin all payments retrieval
    this.ok(res, { message: 'All payments - not yet implemented' });
  });

  getPendingPayments = asyncHandler(async (req, res) => {
    // TODO: implement admin pending payments retrieval
    this.ok(res, { message: 'Pending payments - not yet implemented' });
  });

  getFailedPayments = asyncHandler(async (req, res) => {
    // TODO: implement admin failed payments retrieval
    this.ok(res, { message: 'Failed payments - not yet implemented' });
  });

  getPaymentStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to access payment statistics');
    }
    // You can reuse the earlier example here or leave as TODO for now
    this.ok(res, { message: 'Payment stats - not yet implemented' });
  });

  getPaymentMethodStats = asyncHandler(async (req, res) => {
    // TODO: implement payment method stats
    this.ok(res, { message: 'Payment method stats - not yet implemented' });
  });

  getDailyPaymentStats = asyncHandler(async (req, res) => {
    // TODO: implement daily payment stats
    this.ok(res, { message: 'Daily payment stats - not yet implemented' });
  });

  getMonthlyPaymentStats = asyncHandler(async (req, res) => {
    // TODO: implement monthly payment stats
    this.ok(res, { message: 'Monthly payment stats - not yet implemented' });
  });

  exportPayments = asyncHandler(async (req, res) => {
    // TODO: implement export payments functionality
    this.ok(res, { message: 'Export payments - not yet implemented' });
  });
}

module.exports = new PaymentController();
