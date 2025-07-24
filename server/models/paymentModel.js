/**
 * Payment schema representing payment transactions tied to orders.
 * Supports multiple payment methods, status tracking, refunds, and billing info.
 */

const mongoose = require('mongoose');

const billingAddressSchema = new mongoose.Schema({
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  postalCode: { type: String, trim: true },
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  cardLastFour: { type: String, trim: true, length: 4 },
  cardBrand: { type: String, trim: true },
  expiryMonth: { type: Number, min: 1, max: 12 },
  expiryYear: { type: Number, min: 2000 },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  userId: {
    type: String, // Clerk User ID as string
    required: true,
    index: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'cash', 'mobile_money'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // unique but allow null/undefined if not set yet
  },
  paymentDetails: paymentDetailsSchema,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none',
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  refundReason: {
    type: String,
    trim: true,
  },
  billingAddress: billingAddressSchema,
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Add any helper methods below if needed, e.g. to update status or refund info

module.exports = mongoose.model('Payment', paymentSchema);
