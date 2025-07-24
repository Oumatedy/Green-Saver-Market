const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware, adminOnly, farmersAndAdmin } = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

// Validation schemas
const updateUserSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'farmer'])
    .withMessage('Invalid role')
];

const updateStatusSchema = [
  body('status')
    .isIn(['active', 'suspended', 'pending'])
    .withMessage('Invalid status value')
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// Farmer specific routes (need to be before /:id routes to avoid conflict)
router.get('/farmers/nearby', [
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('radius').optional().isFloat(),
], validationMiddleware, userController.getNearbyFarmers);

router.get('/farmers/top', userController.getTopFarmers);

// User routes
router.get('/me', userController.getUser);
router.put('/me', updateUserSchema, validationMiddleware, userController.updateUser);

// Stats route needs to come before /:id routes to avoid conflict
// Farmer specific routes (must come before /:id routes)
router.get('/farmers/nearby', [
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('radius').optional().isFloat(),
], validationMiddleware, userController.getNearbyFarmers);

router.get('/farmers/top', userController.getTopFarmers);

// Stats route (admin only)
router.get('/stats', adminOnly, userController.getUserStats);

// Admin routes
router.get('/', adminOnly, userController.getAllUsers);
router.get('/:id', adminOnly, userController.getUser);
router.put('/:id', adminOnly, updateUserSchema, validationMiddleware, userController.updateUser);
router.patch('/:id/status', adminOnly, updateStatusSchema, validationMiddleware, userController.updateUserStatus);
router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;

module.exports = router;