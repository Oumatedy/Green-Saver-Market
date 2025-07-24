const orderService = require('../services/orderService');
const BaseController = require('./BaseController'); 
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ForbiddenError } = require('../utils/appError');

class OrderController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create a new order for the authenticated user
   * POST /api/v1/orders
   */
  createOrder = asyncHandler(async (req, res) => {
    // req.user.userId assumed from auth middleware
    const userId = req.user.userId;
    const orderData = req.body;

    const order = await orderService.createOrder(userId, orderData);
    this.created(res, order);
  });

  /**
   * Get orders of the authenticated user with pagination
   * GET /api/v1/orders
   */
  getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const status = req.query.status;

    const result = await orderService.getUserOrders(userId, { page, limit, status });
    this.ok(res, result);
  });

  /**
   * Get a specific order by ID (only if owned by user)
   * GET /api/v1/orders/:orderId
   */
  getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to view this order');
    }

    this.ok(res, order);
  });

  /**
   * Cancel an order by ID (only if owned by user and cancellable)
   * PATCH /api/v1/orders/:orderId/cancel
   */
  cancelOrder = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to cancel this order');
    }

    // Assuming orderService.cancelOrder handles business rules (if cancellable, etc.)
    const canceledOrder = await orderService.cancelOrder(orderId);
    this.ok(res, canceledOrder);
  });

  /**
   * Update order details by ID (only if owned by user and allowed)
   * PATCH /api/v1/orders/:orderId
   */
  updateOrder = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    const updateData = req.body;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.userId.toString() !== userId) {
      throw new ForbiddenError('Not authorized to update this order');
    }

    // Implement any validation/rules in service
    const updatedOrder = await orderService.updateOrder(orderId, updateData);
    this.ok(res, updatedOrder);
  });
}

module.exports = new OrderController();
