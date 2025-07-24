// server/routes/paymentRoute.js

const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();

const paymentController = require('../controllers/PaymentController');
const { authMiddleware, requireRoles } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// Validation rules for creating a payment
const paymentValidation = [
  body('orderId').isMongoId().withMessage('Invalid order ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'cash', 'mobile_money'])
    .withMessage('Invalid payment method'),
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Invalid currency code'),
  body('paymentDetails.cardNumber').optional().isCreditCard().withMessage('Invalid card number'),
  body('paymentDetails.expiryMonth').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
  body('paymentDetails.expiryYear').optional().isInt({ min: new Date().getFullYear() }).withMessage('Invalid expiry year'),
  body('paymentDetails.cvv').optional().isLength({ min: 3, max: 4 }).withMessage('Invalid CVV'),
  body('billingAddress.line1').optional().notEmpty().withMessage('Billing address line 1 is required'),
  body('billingAddress.city').optional().notEmpty().withMessage('Billing city is required'),
  body('billingAddress.postalCode').optional().notEmpty().withMessage('Billing postal code is required'),
  body('billingAddress.country').optional().notEmpty().withMessage('Billing country is required'),
];

// Validation rules for refund processing
const refundValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required'),
  body('refundMethod').isIn(['original', 'bank_transfer', 'credit']).withMessage('Invalid refund method'),
];

// Debug log to check middleware and controller methods
console.log({
  addPaymentMethod: typeof paymentController.addPaymentMethod,
  removePaymentMethod: typeof paymentController.removePaymentMethod,
  getPayment: typeof paymentController.getPayment,
  verifyPayment: typeof paymentController.verifyPayment,
  capturePayment: typeof paymentController.capturePayment,
  getPaymentHistory: typeof paymentController.getPaymentHistory,
  downloadPaymentHistory: typeof paymentController.downloadPaymentHistory,
  processRefund: typeof paymentController.processRefund,
  getRefundStatus: typeof paymentController.getRefundStatus,
  getAllPayments: typeof paymentController.getAllPayments,
  getPendingPayments: typeof paymentController.getPendingPayments,
  getFailedPayments: typeof paymentController.getFailedPayments,
  getPaymentStats: typeof paymentController.getPaymentStats,
  getPaymentMethodStats: typeof paymentController.getPaymentMethodStats,
  getDailyPaymentStats: typeof paymentController.getDailyPaymentStats,
  getMonthlyPaymentStats: typeof paymentController.getMonthlyPaymentStats,
  exportPayments: typeof paymentController.exportPayments,
  requireRolesType: typeof requireRoles,
  validateType: typeof validate,
  refundValidationType: Array.isArray(refundValidation) ? 'array' : typeof refundValidation,
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

/* PAYMENT METHODS MANAGEMENT */
router.get('/methods', paymentController.getPaymentMethods);

router.post(
  '/methods/card',
  [
    body('cardNumber').isCreditCard().withMessage('Invalid card number'),
    body('expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
    body('expiryYear').isInt({ min: new Date().getFullYear() }).withMessage('Invalid expiry year'),
  ],
  validate(),
  paymentController.addPaymentMethod
);

router.delete(
  '/methods/:methodId',
  [param('methodId').isMongoId().withMessage('Invalid payment method ID')],
  validate(),
  paymentController.removePaymentMethod
);

/* PAYMENT PROCESSING */
router.post('/', paymentValidation, validate(), paymentController.createPayment);

router.get(
  '/:paymentId',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  validate(),
  paymentController.getPayment
);

router.get(
  '/:paymentId/status',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  validate(),
  paymentController.getPaymentStatus
);

router.post(
  '/:paymentId/verify',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  validate(),
  paymentController.verifyPayment
);

router.post(
  '/:paymentId/capture',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  validate(),
  paymentController.capturePayment
);

/* CUSTOMER PAYMENT HISTORY */
router.get('/history', paymentController.getPaymentHistory);

router.get(
  '/history/download',
  [query('format').isIn(['pdf', 'csv']).withMessage('Invalid format')],
  validate(),
  paymentController.downloadPaymentHistory
);

/* REFUND MANAGEMENT - ADMIN ONLY */
router.post(
  '/:paymentId/refund',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  requireRoles(['admin']),
  refundValidation,
  validate(),
  paymentController.processRefund
);

router.get(
  '/:paymentId/refund/status',
  [param('paymentId').isMongoId().withMessage('Invalid payment ID')],
  validate(),
  paymentController.getRefundStatus
);

/* ADMIN ROUTES - PROTECTED BY 'admin' ROLE */
router.use('/admin', requireRoles(['admin']));

router.get('/admin/all', paymentController.getAllPayments);
router.get('/admin/pending', paymentController.getPendingPayments);
router.get('/admin/failed', paymentController.getFailedPayments);

/* ANALYTICS AND REPORTING - ADMIN ONLY */
router.get('/stats/overview', paymentController.getPaymentStats);
router.get('/stats/methods', paymentController.getPaymentMethodStats);
router.get('/stats/daily', paymentController.getDailyPaymentStats);
router.get('/stats/monthly', paymentController.getMonthlyPaymentStats);

/* EXPORT PAYMENTS - ADMIN ONLY */
router.post(
  '/export',
  [
    body('format').isIn(['csv', 'pdf', 'excel']).withMessage('Invalid export format'),
    body('dateRange').optional().isObject(),
    body('type')
      .optional()
      .isIn(['all', 'successful', 'failed', 'refunded'])
      .withMessage('Invalid payment type'),
  ],
  validate(),
  paymentController.exportPayments
);

module.exports = router;
