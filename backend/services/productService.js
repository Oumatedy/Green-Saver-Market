const Product = require('../models/productModel');
const { BadRequestError } = require('../utils/AppError');

/**
 * Service class for handling product operations
 */
class ProductService {
  constructor() {
    this.validSortFields = ['createdAt', 'price', 'name', 'rating'];
    this.validCategories = ['vegetables', 'fruits', 'dairy', 'meat', 'grains'];
  }
  /**
   * Get products with filters, sorting, and pagination
   * @param {Object} filters - Filter options (search, category, farmer, organic, minPrice, maxPrice, inStock)
   * @param {string} sortBy - Field to sort by (default: 'createdAt')
   * @param {string} sortOrder - Sort direction ('asc' or 'desc')
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   */
  async getProducts(filters = {}, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10) {
    try {
      const { 
        search, 
        category, 
        farmer, 
        organic, 
        minPrice, 
        maxPrice, 
        inStock 
      } = filters;

      // Build query
      const query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'farmer.name': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) query.category = category;
      if (farmer) query.farmerId = farmer;
      if (organic !== undefined) query.organic = organic;
      if (inStock !== undefined) query.inStock = inStock;
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Sorting
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('farmerId', 'name email profile')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(query)
      ]);

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('farmerId', 'name email profile')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get featured products
   * @param {number} limit - Maximum number of products to return
   */
  async getFeaturedProducts(limit = 8) {
    try {
      return await Product.find({
        inStock: true,
        featured: true
      })
      .populate('farmerId', 'name profile')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  }

  /**
   * Get products grouped by category with statistics
   */
  async getProductsByCategory() {
    try {
      return await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            averagePrice: { $avg: '$price' },
            totalInStock: {
              $sum: {
                $cond: [{ $eq: ['$inStock', true] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
    } catch (error) {
      throw new Error(`Error getting product categories: ${error.message}`);
    }
  }

  /**
   * Update product rating and review count
   * @param {string} productId - Product ID
   * @param {number} rating - New rating value
   * @param {number} reviewCount - New review count
   */
  async updateProductRating(productId, rating, reviewCount) {
    try {
      return await Product.findByIdAndUpdate(
        productId,
        {
          rating,
          reviewCount,
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating product rating: ${error.message}`);
    }
  }

  /**
   * Bulk update product stock levels
   * @param {Array} updates - Array of {productId, stock} objects
   */
  async bulkUpdateStock(updates) {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.productId },
          update: {
            stock: update.stock,
            inStock: update.stock > 0,
            updatedAt: new Date()
          }
        }
      }));

      return await Product.bulkWrite(bulkOps);
    } catch (error) {
      throw new Error(`Error updating product stock: ${error.message}`);
    }
  }

  /**
   * Get products with stock below threshold
   * @param {number} threshold - Stock level threshold
   */
  async getLowStockProducts(threshold = 10) {
    try {
      return await Product.find({
        stock: { $lte: threshold, $gt: 0 },
        inStock: true
      })
      .populate('farmerId', 'name email')
      .sort({ stock: 1 });
    } catch (error) {
      throw new Error(`Error getting low stock products: ${error.message}`);
    }
  }

  /**
   * Get product analytics
   * @param {string} farmerId - Optional farmer ID to filter by
   */
  async getProductAnalytics(farmerId = null) {
    try {
      const matchStage = farmerId ? { farmerId } : {};

      return await Product.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalInStock: {
              $sum: {
                $cond: [{ $eq: ['$inStock', true] }, 1, 0]
              }
            },
            averagePrice: { $avg: '$price' },
            averageRating: { $avg: '$rating' },
            categoryCounts: {
              $push: '$category'
            }
          }
        }
      ]);
    } catch (error) {
      throw new Error(`Error getting product analytics: ${error.message}`);
    }
  }

  /**
   * Get search suggestions for products and categories
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of suggestions
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      const regex = new RegExp(query, 'i');
      
      const [products, categories] = await Promise.all([
        Product.find({
          $or: [
            { name: regex },
            { description: regex }
          ]
        })
        .select('name category')
        .limit(limit),
        
        Product.distinct('category', {
          category: regex
        })
      ]);

      return {
        products: products.map(p => ({
          type: 'product',
          name: p.name,
          category: p.category
        })),
        categories: categories.map(c => ({
          type: 'category',
          name: c
        }))
      };
    } catch (error) {
      throw new Error(`Error getting search suggestions: ${error.message}`);
    }
  }
}

module.exports = new ProductService();