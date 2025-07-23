const express = require('express');
const { body, checkSchema } = require('express-validator');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');
const { validate, sanitizeQuery, adminOrderRules } = require('../middlewares/validationMiddleware');

// Import controllers
const orderController = require('../controllers/orderController');
const adminOrderController = require('../controllers/adminOrderController');
const deliveryController = require('../controllers/deliveryController');
const invoiceController = require('../controllers/invoiceController');

// Validation rules
const orderValidation = [
  // Order items validation
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  // Shipping address validation
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').trim().isMobilePhone().withMessage('Valid phone number is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  
  // Delivery method validation
  body('deliveryMethod').isIn(['pickup', 'delivery']).withMessage('Invalid delivery method'),
  body('deliverySlot.date').optional().isISO8601().withMessage('Invalid delivery date'),
  body('deliverySlot.timeSlot').optional().isString().withMessage('Invalid time slot'),
  
  // Payment validation
  body('paymentMethod').isIn(['card', 'bank_transfer', 'cash', 'mobile_money']).withMessage('Invalid payment method')
];

const statusValidation = [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('note').optional().isString().withMessage('Status note must be a string')
];

// Protected routes - require authentication
router.use(authenticateToken);

// Customer routes
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/', orderValidation, orderController.createOrder);
router.patch('/:id/status', statusValidation, orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

// Delivery routes
router.get('/delivery-slots/available', deliveryController.getAvailableSlots);
router.get('/:id/tracking', deliveryController.getOrderTracking);
router.get('/stats/delivery', requireRole(['admin']), deliveryController.getDeliveryStats);

// Invoice routes
router.get('/:id/invoice', invoiceController.generateInvoice);

// Admin routes
router.use('/admin', requireRole(['admin']));

// Apply query parameter sanitization to all admin routes
router.use('/admin', sanitizeQuery);

// Admin order management routes
router.get('/admin/all', 
  checkSchema(adminOrderRules.getOrders),
  validate(),
  adminOrderController.getAllOrders
);

// Admin statistics routes
router.get('/admin/stats/overview',
  checkSchema({
    timeRange: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 365 },
        errorMessage: 'Time range must be between 1 and 365 days'
      },
      toInt: true
    }
  }),
  validate(),
  adminOrderController.getOrderStats
);

router.get('/admin/stats/revenue',
  checkSchema({
    startDate: {
      in: ['query'],
      optional: true,
      isISO8601: true,
      errorMessage: 'Invalid start date format'
    },
    endDate: {
      in: ['query'],
      optional: true,
      isISO8601: true,
      errorMessage: 'Invalid end date format',
      custom: {
        options: (value, { req }) => {
          if (!req.query.startDate) return true;
          return new Date(value) >= new Date(req.query.startDate);
        },
        errorMessage: 'End date must be after start date'
      }
    }
  }),
  validate(),
  adminOrderController.getRevenueStats
);

router.get('/admin/stats/products',
  checkSchema({
    timeRange: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 365 },
        errorMessage: 'Time range must be between 1 and 365 days'
      },
      toInt: true
    },
    limit: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      },
      toInt: true
    }
  }),
  validate(),
  adminOrderController.getProductOrderStats
);

// Admin export functionality
router.post('/admin/export',
  checkSchema(adminOrderRules.exportOrders),
  validate(),
  adminOrderController.exportOrders
);

module.exports = router;