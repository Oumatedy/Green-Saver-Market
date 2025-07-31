/**
 * User schema definition for the Green Saver Market platform.
 * This schema supports Clerk integration, geospatial queries for farmers,
 * role-based access, ratings, business details, and more.
 */

const mongoose = require('mongoose');

// Define a sub-schema for location using GeoJSON format
// This enables support for geospatial queries using MongoDB's 2dsphere index
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],          // Must always be "Point" for GeoJSON
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number],           // Format: [longitude, latitude]
    required: true,
    validate: {
      validator(value) {
        return Array.isArray(value) &&
               value.length === 2 &&
               value.every(coord => typeof coord === 'number');
      },
      message: 'Coordinates must be an array of two numbers [longitude, latitude]',
    },
  },
}, { _id: false }); // No separate _id for this sub-document

// Define the main User schema
const userSchema = new mongoose.Schema({
  // Clerk authentication ID - must be unique
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // Primary contact info
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

  // User's platform role
  role: {
    type: String,
    enum: ['customer', 'farmer', 'admin'],
    default: 'customer',
    required: true,
  },

  // User profile information (optional)
  profile: {
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    avatar: { type: String },  // URL to avatar image
    bio: { type: String, maxlength: 500 },  // Optional short bio
  },

  // User preferences and settings
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    language: { type: String, default: 'en' },
  },

  // Stripe customer ID for payment tracking
  stripeCustomerId: {
    type: String,
  },

  // Account status: active, inactive, or suspended
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  },

  // Flexible metadata field for future extensibility
  metadata: {
    type: Map,
    of: String,
  },

  // Optional user location (mainly for farmers)
  location: {
    type: pointSchema,
    required: false, // Some users may not provide location
    // DO NOT put `index: '2dsphere'` here to avoid duplication
  },

  // User rating system (for farmers or vendors)
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }, // sum of ratings to recalculate average
  },

  // Sales statistics for farmers/vendors
  totalSales: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Optional business details for farmers/vendors
  businessDetails: {
    businessName: { type: String },
    taxId: { type: String },
    businessLicense: { type: String },
    certifications: [{ type: String }],
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Create a geospatial index on `location` for map-based features
userSchema.index({ location: '2dsphere' });

// Compound index to help search for top-rated active farmers
userSchema.index({
  role: 1,
  status: 1,
  'ratings.average': -1,
  totalSales: -1,
});

// Export the compiled User model
module.exports = mongoose.model('User', userSchema);
