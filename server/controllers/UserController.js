const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const BaseController = require('./BaseController');
const { BadRequestError, ForbiddenError } = require('../utils/appError');

class UserController extends BaseController {
  constructor() {
    super();
    // No extra constructor logic needed unless injecting dependencies
  }

  getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const user = await userService.getUser(userId, req.user.userId, isAdmin);
    if (!user) {
      return this.notFound(res, 'User not found');
    }
    this.ok(res, user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return this.clientError(res, 'Validation failed');
    }

    const userId = req.params.id || req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const updatedUser = await userService.updateUser(userId, req.user.userId, isAdmin, req.body);
    if (!updatedUser) {
      return this.notFound(res, 'User not found or update failed');
    }
    this.ok(res, updatedUser);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to access user list');
    }

    const { role, search } = req.query;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    const result = await userService.getAllUsers({ role, search }, page, limit);
    this.ok(res, result);
  });

  deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to delete users');
    }

    await userService.deleteUser(req.params.id, req.user.userId, true);
    this.ok(res, { message: 'User deleted successfully' });
  });

  getUserStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to access user statistics');
    }

    const stats = await userService.getUserStats();
    this.ok(res, stats);
  });

  updateUserStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return this.forbidden(res, 'Not authorized to update user status');
    }

    const { status } = req.body;
    if (!status) {
      return this.clientError(res, 'Status is required');
    }

    const user = await userService.updateUserStatus(req.params.id, status);
    if (!user) {
      return this.notFound(res, 'User not found or status update failed');
    }
    this.ok(res, user);
  });

  getNearbyFarmers = asyncHandler(async (req, res) => {
    const latitude = Number.parseFloat(req.query.latitude);
    const longitude = Number.parseFloat(req.query.longitude);
    const radius = Number.parseFloat(req.query.radius) || 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return this.clientError(res, 'Invalid or missing latitude/longitude');
    }

    const farmers = await userService.getNearbyFarmers(latitude, longitude, radius);
    this.ok(res, farmers);
  });

  getTopFarmers = asyncHandler(async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 10;

    const farmers = await userService.getTopFarmers(limit);
    this.ok(res, farmers);
  });
}

module.exports = new UserController();
