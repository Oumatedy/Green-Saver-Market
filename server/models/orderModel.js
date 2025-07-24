/**
 * Order schema representing customer orders, including items,
 * shipping and delivery info, payment, status history and metadata.
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  farmerId: {
    type: String,
    required: true,
    index: true,
  },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  deliveryInstructions: { type: String, trim: true },
}, { _id: false });

const deliverySlotSchema = new mongoose.Schema({
  date: Date,
  timeSlot: String,
}, { _id: false });

const paymentResultSchema = new mongoose.Schema({
  id: String,
  status: String,
  updateTime: Date,
  paymentMethod: String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  user: { // Clerk user ID as string
    type: String,
    required: true,
    index: true,
  },
  orderItems: {
    type: [orderItemSchema],
    required: true,
    validate: [items => items.length > 0, 'Must include at least one order item'],
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true,
  },
  deliverySlot: {
    type: deliverySlotSchema,
  },
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, min: 0, default: 0 },
    shippingFee: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'cash', 'mobile_money'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentResult: {
    type: paymentResultSchema,
  },
  paidAt: Date,
  deliveredAt: Date,
  notes: { type: String, trim: true },
  cancelReason: { type: String, trim: true },
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
  },
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Indexes to optimize queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.farmerId': 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

/**
 * Calculates pricing totals (subtotal, tax, shipping fee, total)
 * This method assumes tax 10% and delivery shipping fee fixed at 10 currency units.
 * Update the logic if you want dynamic tax/shipping.
 */
orderSchema.methods.calculateTotals = function () {
  const subtotal = this.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1; // 10% tax
  const shippingFee = this.deliveryMethod === 'delivery' ? 10 : 0;
  const discount = this.pricing?.discount || 0;
  const total = subtotal + tax + shippingFee - discount;

  this.pricing = {
    subtotal,
    tax,
    shippingFee,
    discount,
    total,
  };
};

/**
 * Updates order status and responsible note, adding entry to status history.
 * Updates deliveredAt timestamp if status is 'delivered'.
 */
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date(),
  });

  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
};

/**
 * Pre-save middleware to generate a unique orderId on new orders.
 * Format example: ORD-2307-0001 (YearMonth-SequentialNumber)
 */
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // last two digits of year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month in MM format

    // Count existing documents to generate sequence number (consider concurrency in high-load environments)
    const count = await this.constructor.countDocuments();

    this.orderId = `ORD-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
