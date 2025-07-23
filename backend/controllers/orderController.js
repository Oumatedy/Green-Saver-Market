const { validationResult } = require('express-validator');
const orderService = require('../services/orderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/AppError');

/**
 * Controller handling customer order operations
 */
class OrderController {
  /**
   * Get orders for the authenticated user
   * @route GET /api/orders/my-orders
   * @access Private
   */
  getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const result = await orderService.getUserOrders(req.user.userId, page, limit, status);
    ApiResponse.success(result, 'Orders retrieved successfully').send(res);
  });

  /**
   * Get a specific order
   * @route GET /api/orders/:id
   * @access Private
   */
  getOrder = asyncHandler(async (req, res) => {
    const order = await orderService.getOrder(req.params.id, req.user.userId, req.user.role);
    ApiResponse.success(order, 'Order retrieved successfully').send(res);
  });

  /**
   * Create a new order
   * @route POST /api/orders
   * @access Private
   */
  createOrder = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const order = await orderService.createOrder(req.user.userId, req.body);
    ApiResponse.success(order, 'Order created successfully').send(res, 201);
  });

  /**
   * Update order status (for customers - limited status changes)
   * @route PATCH /api/orders/:id/status
   * @access Private
   */
  updateOrderStatus = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id, 
      req.user.userId, 
      status, 
      note,
      req.user.role
    );
    ApiResponse.success(order, 'Order status updated successfully').send(res);
  });

  /**
   * Cancel an order
   * @route DELETE /api/orders/:id
   * @access Private
   */
  cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.user.userId);
    ApiResponse.success(order, 'Order cancelled successfully').send(res);
  });
}

module.exports = new OrderController();

// All order creation and update logic has been moved to the orderService

// All admin, invoice, and statistics related functions have been moved to their respective controllers