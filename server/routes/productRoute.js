const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Validation rules for product creation and update
 * Adjust these according to your product schema
 */
const productValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name must be at most 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Product description must be at most 1000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than zero'),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of URLs'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
];

/**
 * Validation rule for product ID parameter
 */
const productIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

/**
 * Validation rules for product query parameters (pagination, filtering)
 */
const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),

  query('priceMin')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('priceMin must be a number greater than zero'),

  query('priceMax')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('priceMax must be a number greater than zero'),
];

// ----------------------
// Public Routes
// ----------------------

/**
 * GET /api/v1/products
 * Get a list of products
 * Supports optional pagination and filtering
 */
router.get(
  '/',
  productQueryValidation,
  validate(),
  getProducts
);

/**
 * GET /api/v1/products/:id
 * Get details of a product by ID
 */
router.get(
  '/:id',
  productIdParamValidation,
  validate(),
  getProduct
);

// ----------------------
// Protected Routes (Admin only)
// ----------------------

/**
 * POST /api/v1/products
 * Create a new product (admin only)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  productValidationRules,
  validate(),
  createProduct
);

/**
 * PUT /api/v1/products/:id
 * Update an existing product (admin only)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  productIdParamValidation,
  productValidationRules,
  validate(),
  updateProduct
);

/**
 * DELETE /api/v1/products/:id
 * Delete a product (admin only)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  productIdParamValidation,
  validate(),
  deleteProduct
);

module.exports = router;
