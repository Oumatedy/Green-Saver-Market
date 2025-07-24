const deliveryService = require('../services/deliveryService');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');

class DeliveryController extends BaseController {
  constructor() {
    super();
  }

  getAvailableSlots = asyncHandler(async (req, res) => {
    // Assuming synchronous service call, wrap into async for consistency
    const slots = await deliveryService.getAvailableSlots();
    this.ok(res, slots);
  });

  getDeliveryStats = asyncHandler(async (req, res) => {
    const stats = await deliveryService.getDeliveryStats();
    this.ok(res, stats);
  });

  getOrderTracking = asyncHandler(async (req, res) => {
    const tracking = await deliveryService.getOrderTracking(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    this.ok(res, tracking);
  });
}

module.exports = new DeliveryController();
