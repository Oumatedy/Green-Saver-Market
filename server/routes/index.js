const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoute');
const orderRoutes = require('./orderRoute');
const userRoutes = require('./userRoute');
const messageRoutes = require('./messageRoute');
const paymentRoutes = require('./paymentRoute');
const adminOrderRoutes = require('./adminOrderRoute');

// Mount routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin/orders', adminOrderRoutes);

module.exports = router;
