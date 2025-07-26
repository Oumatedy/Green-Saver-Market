const Product = require('../models/productModel');
const { validationResult } = require('express-validator');
const BaseController = require('../controllers/BaseController');

class ProductController extends BaseController {
  // GET /api/v1/products
  async getProducts(req, res) {
    try {
      const {
        category,
        search,
        farmer,
        organic,
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (farmer) filter.farmerId = farmer;
      if (organic !== undefined) filter.organic = organic === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const products = await Product.find(filter)
        .populate('farmerId', 'name email profile')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Product.countDocuments(filter);

      this.ok(res, {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // GET /api/v1/products/:id
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate('farmerId', 'name email profile')
        .lean();

      if (!product) return this.notFound(res, 'Product not found');
      this.ok(res, product);
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // POST /api/v1/products
  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return this.clientError(res, errors.array());
      }

      const productData = {
        ...req.body,
        farmerId: req.user.userId
      };

      const product = new Product(productData);
      await product.save();
      await product.populate('farmerId', 'name email profile');

      this.created(res, {
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // PUT /api/v1/products/:id
  async updateProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return this.clientError(res, errors.array());
      }

      const product = await Product.findById(req.params.id);
      if (!product) return this.notFound(res, 'Product not found');

      if (req.user.role !== 'admin' && product.farmerId.toString() !== req.user.userId) {
        return this.forbidden(res, 'Not authorized to update this product');
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('farmerId', 'name email profile');

      this.ok(res, {
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // DELETE /api/v1/products/:id
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return this.notFound(res, 'Product not found');

      if (req.user.role !== 'admin' && product.farmerId.toString() !== req.user.userId) {
        return this.forbidden(res, 'Not authorized to delete this product');
      }

      await Product.findByIdAndDelete(req.params.id);

      this.ok(res, { message: 'Product deleted successfully' });
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // GET /api/v1/farmers/:farmerId/products
  async getFarmerProducts(req, res) {
    try {
      const farmerId = req.params.farmerId || req.user.userId;

      const products = await Product.find({ farmerId })
        .sort({ createdAt: -1 })
        .lean();

      this.ok(res, products);
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }

  // PATCH /api/v1/products/:id/stock
  async updateStock(req, res) {
    try {
      const { quantity } = req.body;

      if (quantity === undefined || isNaN(quantity)) {
        return this.clientError(res, 'Quantity must be a valid number');
      }

      const product = await Product.findById(req.params.id);
      if (!product) return this.notFound(res, 'Product not found');

      product.stock = quantity;
      product.inStock = quantity > 0;
      await product.save();

      this.ok(res, {
        message: 'Stock updated successfully',
        product
      });
    } catch (error) {
      console.error(error);
      this.fail(res, error);
    }
  }
}

module.exports = new ProductController();
