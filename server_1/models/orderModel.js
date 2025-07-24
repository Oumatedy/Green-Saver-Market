const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: String,  // Clerk User ID
    required: true,
    index: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    farmerId: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    deliveryInstructions: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  deliverySlot: {
    date: Date,
    timeSlot: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: Number,
    shippingFee: Number,
    discount: Number,
    total: {
      type: Number,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer', 'cash', 'mobile_money']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: Date,
    paymentMethod: String
  },
  paidAt: Date,
  deliveredAt: Date,
  notes: String,
  cancelReason: String,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: String
  }],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
});

// Indexes for efficient querying
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.farmerId': 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Methods
orderSchema.methods.calculateTotals = function() {
  const subtotal = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shippingFee = this.deliveryMethod === 'delivery' ? 10 : 0;
  const total = subtotal + tax + shippingFee - (this.pricing.discount || 0);

  this.pricing = {
    subtotal,
    tax,
    shippingFee,
    discount: this.pricing.discount || 0,
    total
  };
};

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date()
  });

  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
};

// Generate Order ID
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments();
    this.orderId = `ORD-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
