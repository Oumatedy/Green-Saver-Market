const mongoose = require('mongoose');

// Define the point schema for geospatial queries
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'farmer', 'admin'],
    required: true,
    default: 'customer'
  },
  profile: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    avatar: String,
    bio: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' }
  },
  stripeCustomerId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: String
  },
  location: {
    type: pointSchema,
    index: '2dsphere' // Enable geospatial queries
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  totalSales: {
    type: Number,
    default: 0
  },
  businessDetails: {
    businessName: String,
    taxId: String,
    businessLicense: String,
    certifications: [String]
  }
}, {
  timestamps: true,
});

// Create geospatial index
userSchema.index({ location: '2dsphere' });

// Create compound index for top farmers query
userSchema.index({ 
  role: 1, 
  status: 1, 
  'ratings.average': -1,
  totalSales: -1 
});

module.exports = mongoose.model('User', userSchema);
