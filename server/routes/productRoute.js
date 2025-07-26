// routes/productRoutes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const productController = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// ----------------------
// Validation Rules
// ----------------------

const productValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name must be at most 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Product description must be at most 1000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than zero'),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('images')
    .optional()
    .isArray().withMessage('Images must be an array of URLs'),

  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL'),
];

const productIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('category')
    .optional()
    .isString().withMessage('Category must be a string'),

  query('priceMin')
    .optional()
    .isFloat({ gt: 0 }).withMessage('priceMin must be a number greater than zero'),

  query('priceMax')
    .optional()
    .isFloat({ gt: 0 }).withMessage('priceMax must be a number greater than zero'),
];

// ----------------------
// Routes
// ----------------------

// Public
router.get(
  '/',
  productQueryValidation,
  validate(),
  productController.getProducts.bind(productController)
);

router.get(
  '/:id',
  productIdParamValidation,
  validate(),
  productController.getProduct.bind(productController)
);

// Admin-only
router.post(
  '/',
  authMiddleware,
  adminOnly,
  productValidationRules,
  validate(),
  productController.createProduct.bind(productController)
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  productIdParamValidation,
  productValidationRules,
  validate(),
  productController.updateProduct.bind(productController)
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  productIdParamValidation,
  validate(),
  productController.deleteProduct.bind(productController)
);

module.exports = router;
