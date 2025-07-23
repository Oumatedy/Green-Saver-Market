const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order',
  },
  userId: {
    type: String,  // Clerk User ID
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'cash', 'mobile_money']
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
  paymentDetails: {
    cardLastFour: String,
    cardBrand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  },
  refundAmount: Number,
  refundReason: String,
  billingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
