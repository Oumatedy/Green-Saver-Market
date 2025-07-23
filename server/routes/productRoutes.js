const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes requiring auth and admin role
// Option 1: Spread the array
// router.post('/', ....[authMiddleware, adminMiddleware], createProduct);
// router.put('/:id', ....[authMiddleware, adminMiddleware], updateProduct);
// router.delete('/:id', ....[authMiddleware, adminMiddleware], deleteProduct);

// Option 2: Pass them as separate arguments (alternative approach)
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;