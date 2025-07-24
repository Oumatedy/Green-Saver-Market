/**
 * User schema including roles, profiles, preferences, location (geospatial),
 * business details, and ratings. Supports Clerk integration via clerkId.
 */

const mongoose = require('mongoose');

// Define the GeoJSON Point schema for location field (used in geospatial queries)
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator(value) {
        // Coordinates must be an array of length 2: [lng, lat]
        return Array.isArray(value) && value.length === 2 && value.every(coord => typeof coord === 'number');
      },
      message: 'Coordinates must be an array of two numbers [longitude, latitude]',
    },
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true, // index for faster lookup by Clerk ID
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'farmer', 'admin'],
    default: 'customer',
    required: true,
  },

  profile: {
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    avatar: { type: String }, // URL to user avatar/profile image
    bio: { type: String, maxlength: 500 },
  },

  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    language: { type: String, default: 'en' },
  },

  stripeCustomerId: { // For Stripe integration reference
    type: String,
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true, // indexed to filter active users efficiently
  },

  metadata: {
    type: Map,
    of: String, // flexible key-value metadata if needed
  },

  location: {
    type: pointSchema,
    index: '2dsphere', // geospatial index to enable location queries
    required: false,   // optional - only for farmers or users who provide location
  },

  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }, // sum of ratings (for easier recalculation)
  },

  totalSales: {
    type: Number,
    default: 0,
    min: 0,
  },

  businessDetails: {
    businessName: { type: String },
    taxId: { type: String },
    businessLicense: { type: String },
    certifications: [{ type: String }],
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});


// Geospatial index on location
userSchema.index({ location: '2dsphere' });

// Compound index to query top farmers: active status, sorted by rating and sales desc
userSchema.index({ 
  role: 1, 
  status: 1, 
  'ratings.average': -1, 
  totalSales: -1
});


module.exports = mongoose.model('User', userSchema);
