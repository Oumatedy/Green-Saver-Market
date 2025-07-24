const express = require('express');
const { body, query, param } = require('express-validator');
const userController = require('../controllers/UserController');
const { authMiddleware, adminOnly, farmersAndAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

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
    .withMessage('Invalid role'),
];

const updateStatusSchema = [
  body('status')
    .isIn(['active', 'suspended', 'pending'])
    .withMessage('Invalid status value'),
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// Farmer-specific routes
// Use query validation instead of body for GET requests
router.get(
  '/farmers/nearby',
  [
    query('latitude').isFloat().withMessage('Latitude must be a float'),
    query('longitude').isFloat().withMessage('Longitude must be a float'),
    query('radius').optional().isFloat().withMessage('Radius must be a float'),
  ],
  validate(),
  userController.getNearbyFarmers
);

router.get('/farmers/top', userController.getTopFarmers);

// User self routes
router.get('/me', userController.getUser);
router.put('/me', updateUserSchema, validate(), userController.updateUser);

// Admin-only routes
router.get('/stats', adminOnly, userController.getUserStats);

router.get('/', adminOnly, userController.getAllUsers);

router.get(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate(),
  userController.getUser
);

router.put(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  updateUserSchema,
  validate(),
  userController.updateUser
);

router.patch(
  '/:id/status',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  updateStatusSchema,
  validate(),
  userController.updateUserStatus
);

router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate(),
  userController.deleteUser
);

module.exports = router;
