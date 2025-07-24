const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  subCategory: {
    type: String,
    index: true,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  farmerId: {
    type: String,
    required: true,
    index: true,
  },
  seasonality: {
    startMonth: Number,
    endMonth: Number,
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
    farm: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    distance: Number, // Distance from delivery hub
  },
  harvestDate: Date,
  shelfLife: Number, // in days
  storageInstructions: String,
  tags: [{
    type: String,
    index: true,
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
    },
  },
  reviews: [{
    userId: String,
    rating: Number,
    comment: String,
    images: [{
      url: String,
      publicId: String,
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  bulkPricing: [{
    minQuantity: Number,
    price: Number,
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

module.exports = mongoose.model('Product', productSchema);
