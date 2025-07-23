const deliveryService = require('../services/deliveryService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class DeliveryController {
  getAvailableSlots = asyncHandler(async (req, res) => {
    const slots = deliveryService.getAvailableSlots();
    ApiResponse.success(slots).send(res);
  });

  getDeliveryStats = asyncHandler(async (req, res) => {
    const stats = await deliveryService.getDeliveryStats();
    ApiResponse.success(stats).send(res);
  });

  getOrderTracking = asyncHandler(async (req, res) => {
    const tracking = await deliveryService.getOrderTracking(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    ApiResponse.success(tracking).send(res);
  });
}

module.exports = new DeliveryController();
