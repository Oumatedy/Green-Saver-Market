const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Validation rules
const paymentValidation = [
  body('orderId').isMongoId().withMessage('Invalid order ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['card', 'bank_transfer', 'cash', 'mobile_money']).withMessage('Invalid payment method'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
  
  // Card payment validation
  body('paymentDetails.cardNumber').optional().isCreditCard().withMessage('Invalid card number'),
  body('paymentDetails.expiryMonth').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
  body('paymentDetails.expiryYear').optional().isInt({ min: 2023 }).withMessage('Invalid expiry year'),
  body('paymentDetails.cvv').optional().isLength({ min: 3, max: 4 }).withMessage('Invalid CVV'),
  
  // Billing address validation
  body('billingAddress.line1').optional().notEmpty().withMessage('Billing address line 1 is required'),
  body('billingAddress.city').optional().notEmpty().withMessage('Billing city is required'),
  body('billingAddress.postalCode').optional().notEmpty().withMessage('Billing postal code is required'),
  body('billingAddress.country').optional().notEmpty().withMessage('Billing country is required')
];

const refundValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be greater than 0'),
  body('reason').trim().notEmpty().withMessage('Refund reason is required'),
  body('refundMethod').isIn(['original', 'bank_transfer', 'credit']).withMessage('Invalid refund method')
];

// Protected routes - require authentication
router.use(authenticateToken);

// Payment Methods Management
router.get('/methods', paymentController.getPaymentMethods);
router.post('/methods/card', [
  body('cardNumber').isCreditCard().withMessage('Invalid card number'),
  body('expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
  body('expiryYear').isInt({ min: 2023 }).withMessage('Invalid expiry year'),
], paymentController.addPaymentMethod);
router.delete('/methods/:methodId', paymentController.removePaymentMethod);

// Payment Processing
router.post('/', paymentValidation, paymentController.createPayment);
router.get('/:paymentId', paymentController.getPayment);
router.get('/:paymentId/status', paymentController.getPaymentStatus);
router.post('/:paymentId/verify', paymentController.verifyPayment);
router.post('/:paymentId/capture', paymentController.capturePayment);

// Customer Payment History
router.get('/history', paymentController.getPaymentHistory);
router.get('/history/download', [
  body('format').isIn(['pdf', 'csv']).withMessage('Invalid format'),
], paymentController.downloadPaymentHistory);

// Refund Management
router.post('/:paymentId/refund', requireRole(['admin']), refundValidation, paymentController.processRefund);
router.get('/:paymentId/refund/status', paymentController.getRefundStatus);

// Admin Routes
router.use('/admin', requireRole(['admin']));
router.get('/admin/all', paymentController.getAllPayments);
router.get('/admin/pending', paymentController.getPendingPayments);
router.get('/admin/failed', paymentController.getFailedPayments);

// Analytics and Reporting
router.get('/stats/overview', requireRole(['admin']), paymentController.getPaymentStats);
router.get('/stats/methods', requireRole(['admin']), paymentController.getPaymentMethodStats);
router.get('/stats/daily', requireRole(['admin']), paymentController.getDailyPaymentStats);
router.get('/stats/monthly', requireRole(['admin']), paymentController.getMonthlyPaymentStats);

// Export functionality
router.post('/export', requireRole(['admin']), [
  body('format').isIn(['csv', 'pdf', 'excel']).withMessage('Invalid format'),
  body('dateRange').optional().isObject(),
  body('type').optional().isIn(['all', 'successful', 'failed', 'refunded']).withMessage('Invalid payment type')
], paymentController.exportPayments);

module.exports = router;