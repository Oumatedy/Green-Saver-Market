const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const orderController = require('../controllers/OrderController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// Validation rules for creating an order (adjust fields as per your schema)
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required'),
];

// Validation rules for querying user orders
const getUserOrdersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
];

// Validation rules for order ID params
const orderIdParamValidation = [
  param('orderId').notEmpty().withMessage('Order ID is required'),
];

// Protect all routes - user must be authenticated
router.use(authMiddleware);

// Create a new order
router.post('/', createOrderValidation, validate(), orderController.createOrder);

// Get paged orders of the authenticated user, optional status filtering
router.get('/', getUserOrdersValidation, validate(), orderController.getUserOrders);

// Get details of a specific order owned by user
router.get('/:orderId', orderIdParamValidation, validate(), orderController.getOrderById);

// Cancel an order owned by user
router.patch('/:orderId/cancel', orderIdParamValidation, validate(), orderController.cancelOrder);

// Update an order (optional, ensure your controller and service support this)
router.patch('/:orderId', orderIdParamValidation, validate(), orderController.updateOrder);

module.exports = router;
