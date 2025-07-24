/**
 * Product schema for organic marketplace.
 * Includes pricing, categorization, stock, farmer reference,
 * nutritional info, organic certifications, geolocation origin,
 * ratings/reviews, bulk pricing, and status.
 */

const mongoose = require('mongoose');

/**
 * GeoJSON Point schema for geospatial indexing of product origin location
 */
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere', // For geospatial queries
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length === 2 && value.every(coord => typeof coord === 'number');
      },
      message: 'Coordinates must be an array of two numbers [longitude, latitude]',
    },
  },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountedPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        // discountedPrice must be <= price if set
        return value == null || value <= this.price;
      },
      message: 'Discounted price should not exceed regular price',
    },
  },
  category: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  subCategory: {
    type: String,
    index: true,
    trim: true,
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // references farmer user
    required: true,
    index: true,
  },
  seasonality: {
    startMonth: { type: Number, min: 1, max: 12 },
    endMonth: { type: Number, min: 1, max: 12 },
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    vitamins: [String],
    minerals: [String],
  },
  organic: {
    type: Boolean,
    default: false,
    index: true,
  },
  certifications: [{
    type: String,
    enum: ['Organic', 'Fair Trade', 'Non-GMO', 'Local', 'Sustainable'],
  }],
  origin: {
    farm: { type: String },
    location: pointSchema,
    distance: { type: Number, min: 0 }, // distance from delivery hub in kms or miles
  },
  harvestDate: { type: Date },
  shelfLife: { type: Number, min: 0 }, // in days
  storageInstructions: { type: String, trim: true },
  tags: [{
    type: String,
    index: true,
    trim: true,
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    images: [{
      url: { type: String, required: true },
      publicId: { type: String },
    }],
    createdAt: { type: Date, default: Date.now },
  }],
  bulkPricing: [{
    minQuantity: { type: Number, min: 1 },
    price: { type: Number, min: 0 },
  }],
  status: {
    type: String,
    enum: ['active', 'outOfSeason', 'outOfStock', 'discontinued'],
    default: 'active',
    index: true,
  },
}, {
  timestamps: true,
});

// Optional: You might want a pre-save hook here to validate or calculate fields

module.exports = mongoose.model('Product', productSchema);
