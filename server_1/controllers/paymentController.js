const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const { validationResult } = require('express-validator');

// Create payment intent
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId, paymentMethod, amount } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Verify amount matches order total
    if (Math.abs(amount - order.total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match order total'
      });
    }

    // Generate payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

    // Create payment record
    const payment = new Payment({
      paymentId,
      orderId: order._id,
      userId: req.user.userId,
      amount,
      paymentMethod,
      status: 'pending',
      transactionData: {
        // This would contain payment processor specific data
        // In a real app, you'd integrate with Stripe, PayPal, etc.
        paymentIntentId: `pi_${Math.random().toString(36).substring(2)}`,
        processorResponse: null
      }
    });

    await payment.save();

    // In a real application, here you would:
    // 1. Create payment intent with payment processor (Stripe, PayPal, etc.)
    // 2. Return client secret for frontend to confirm payment
    // 3. Handle webhooks for payment confirmation

    // For demo purposes, we'll simulate immediate success
    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.transactionData.processorResponse = {
          transactionId: `txn_${Math.random().toString(36).substring(2)}`,
          processedAt: new Date(),
          paymentProcessor: 'stripe' // or whatever processor
        };
        payment.processedAt = new Date();
        await payment.save();

        // Update order payment status
        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        await order.save();
      } catch (error) {
        console.error('Error processing simulated payment:', error);
      }
    }, 2000); // Simulate 2 second processing time

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        // In real app, return client secret for frontend
        clientSecret: `pi_${Math.random().toString(36).substring(2)}_secret`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId })
      .populate('orderId', 'orderId total')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user can access this payment
    if (req.user.role !== 'admin' && payment.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

// Get all payments (admin only)
exports.getPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access payments'
      });
    }

    const { status, userId, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('orderId', 'orderId total')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// Process refund (admin only)
exports.processRefund = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refunds'
      });
    }

    const { amount, reason } = req.body;
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // In a real app, process refund with payment processor
    // For demo, we'll just update the payment record
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.refundedBy = req.user.userId;

    await payment.save();

    // Update order status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.status = 'cancelled';
      order.paymentStatus = 'refunded';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access payment statistics'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total payments and revenue
    const totalStats = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    // Recent payments
    const recentStats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          recentRevenue: { $sum: '$amount' },
          recentPayments: { $sum: 1 }
        }
      }
    ]);

    // Payment method distribution
    const methodStats = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    // Status distribution
    const statusStats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalStats[0]?.totalRevenue || 0,
        totalPayments: totalStats[0]?.totalPayments || 0,
        averagePayment: totalStats[0]?.averagePayment || 0,
        recentRevenue: recentStats[0]?.recentRevenue || 0,
        recentPayments: recentStats[0]?.recentPayments || 0,
        paymentMethods: methodStats,
        statusDistribution: statusStats,
        dailyTrend: dailyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
};