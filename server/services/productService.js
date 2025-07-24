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
   * @param {Object} filters - Filter options (search, category, farmerId, organic, minPrice, maxPrice, inStock)
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
        farmerId,
        organic,
        minPrice,
        maxPrice,
        inStock,
      } = filters;

      // Validate sortBy field
      if (!this.validSortFields.includes(sortBy)) {
        throw new BadRequestError(`Invalid sortBy field: ${sortBy}`);
      }

      // Validate category if provided
      if (category && !this.validCategories.includes(category)) {
        throw new BadRequestError(`Invalid category: ${category}`);
      }

      // Build Mongo query
      const query = {};

      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { name: regex },
          { description: regex },
          { 'farmer.name': regex },
        ];
      }

      if (category) query.category = category;
      if (farmerId) query.farmerId = farmerId;
      if (organic !== undefined) query.organic = !!organic;
      if (inStock !== undefined) query.inStock = !!inStock;

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      // Sorting setup
      const sort = {};
      sort[sortBy] = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

      // Pagination calculations ensuring positive integers
      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // limit max 100

      const skip = (parsedPage - 1) * parsedLimit;

      // Execute queries in parallel
      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('farmerId', 'name email profile')
          .sort(sort)
          .skip(skip)
          .limit(parsedLimit),
        Product.countDocuments(query),
      ]);

      return {
        products,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          pages: Math.ceil(total / parsedLimit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  /**
   * Get featured products
   * @param {number} limit - Maximum number of products to return
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 8));
      return await Product.find({
        inStock: true,
        featured: true,
      })
        .populate('farmerId', 'name profile')
        .sort({ rating: -1, createdAt: -1 })
        .limit(parsedLimit);
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
                $cond: [{ $eq: ['$inStock', true] }, 1, 0],
              },
            },
          },
        },
        { $sort: { count: -1 } },
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
    if (!productId) throw new BadRequestError('Product ID is required');
    if (rating === undefined || reviewCount === undefined) {
      throw new BadRequestError('Rating and review count are required');
    }

    try {
      return await Product.findByIdAndUpdate(
        productId,
        { rating, reviewCount, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error updating product rating: ${error.message}`);
    }
  }

  /**
   * Bulk update product stock levels
   * @param {Array} updates - Array of { productId, stock } objects
   */
  async bulkUpdateStock(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new BadRequestError('Updates must be a non-empty array');
    }

    try {
      const bulkOps = updates.map(({ productId, stock }) => {
        if (!productId || stock === undefined)
          throw new BadRequestError('Each update must have productId and stock');

        return {
          updateOne: {
            filter: { _id: productId },
            update: {
              stock,
              inStock: stock > 0,
              updatedAt: new Date(),
            },
          },
        };
      });

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
      const parsedThreshold = Math.max(1, parseInt(threshold, 10) || 10);
      return await Product.find({
        stock: { $lte: parsedThreshold, $gt: 0 },
        inStock: true,
      })
        .populate('farmerId', 'name email')
        .sort({ stock: 1 });
    } catch (error) {
      throw new Error(`Error getting low stock products: ${error.message}`);
    }
  }

  /**
   * Get product analytics optionally filtered by farmer
   * @param {string|null} farmerId - Optional farmer ID to filter by
   */
  async getProductAnalytics(farmerId = null) {
    try {
      const matchStage = farmerId ? { farmerId } : {};

      const result = await Product.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalInStock: {
              $sum: {
                $cond: [{ $eq: ['$inStock', true] }, 1, 0],
              },
            },
            averagePrice: { $avg: '$price' },
            averageRating: { $avg: '$rating' },
            categoryCounts: { $push: '$category' },
          },
        },
      ]);

      return result[0] || {
        totalProducts: 0,
        totalInStock: 0,
        averagePrice: 0,
        averageRating: 0,
        categoryCounts: [],
      };
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
    if (!query) throw new BadRequestError('Query string is required');
    try {
      const regex = new RegExp(query, 'i');

      const [products, categories] = await Promise.all([
        Product.find({
          $or: [{ name: regex }, { description: regex }],
        })
          .select('name category')
          .limit(limit),
        Product.distinct('category', { category: regex }),
      ]);

      return {
        products: products.map((p) => ({
          type: 'product',
          name: p.name,
          category: p.category,
        })),
        categories: categories.map((c) => ({
          type: 'category',
          name: c,
        })),
      };
    } catch (error) {
      throw new Error(`Error getting search suggestions: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
