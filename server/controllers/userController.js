const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { BadRequestError, ForbiddenError } = require('../utils/AppError');

/**
 * Controller handling user operations
 */
class UserController {
  constructor() {
    // No need for binding when using arrow functions
  }

  /**
   * Get user profile
   * @route GET /api/users/:id
   * @access Private
   */
  getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user.userId;
    const user = await userService.getUser(userId, req.user.userId, req.user.role === 'admin');
    ApiResponse.success(user, 'User profile retrieved successfully').send(res);
  });

  /**
   * Update user profile
   * @route PUT /api/users/:id
   * @access Private
   */
  updateUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const userId = req.params.id || req.user.userId;
    const updatedUser = await userService.updateUser(
      userId,
      req.user.userId,
      req.user.role === 'admin',
      req.body
    );
    
    ApiResponse.success(updatedUser, 'Profile updated successfully').send(res);
  });

  /**
   * Get all users (admin only)
   * @route GET /api/users
   * @access Admin
   */
  getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to access user list');
    }

    const { role, page = 1, limit = 20, search } = req.query;
    const result = await userService.getAllUsers(
      { role, search },
      parseInt(page),
      parseInt(limit)
    );
    
    ApiResponse.success(result, 'Users retrieved successfully').send(res);
  });

  /**
   * Delete user (admin only)
   * @route DELETE /api/users/:id
   * @access Admin
   */
  deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete users');
    }

    await userService.deleteUser(req.params.id, req.user.userId, req.user.role === 'admin');
    ApiResponse.success(null, 'User deleted successfully').send(res);
  });

  /**
   * Get user statistics (admin only)
   * @route GET /api/users/stats
   * @access Admin
   */
  getUserStats = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to access user statistics');
    }

    const stats = await userService.getUserStats();
    ApiResponse.success(stats, 'User statistics retrieved successfully').send(res);
  });

  /**
   * Update user status (admin only)
   * @route PATCH /api/users/:id/status
   * @access Admin
   */
  updateUserStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update user status');
    }

    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    ApiResponse.success(user, 'User status updated successfully').send(res);
  });

  /**
   * Get nearby farmers based on location
   * @route GET /api/users/farmers/nearby
   * @access Public
   */
  getNearbyFarmers = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius = 10 } = req.query; // default 10km radius
    const farmers = await userService.getNearbyFarmers(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );
    ApiResponse.success(farmers, 'Nearby farmers retrieved successfully').send(res);
  });

  /**
   * Get top rated farmers
   * @route GET /api/users/farmers/top
   * @access Public
   */
  getTopFarmers = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const farmers = await userService.getTopFarmers(parseInt(limit));
    ApiResponse.success(farmers, 'Top farmers retrieved successfully').send(res);
  });
}

module.exports = new UserController();