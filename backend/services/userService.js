const User = require('../models/userModel');
const { BadRequestError, NotFoundError } = require('../utils/AppError');

class UserService {
  /**
   * Get a user by ID
   */
  async getUser(userId, requesterId, isAdmin = false) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Only admins can view full profiles of other users
    if (!isAdmin && userId !== requesterId) {
      // Return limited public info for other users
      return {
        _id: user._id,
        name: user.name,
        role: user.role,
        ratings: user.ratings,
        location: user.location
      };
    }

    return user;
  }

  /**
   * Update a user's profile
   */
  async updateUser(userId, requesterId, isAdmin, updateData) {
    if (!isAdmin && userId !== requesterId) {
      throw new BadRequestError('Not authorized to update this profile');
    }

    // Don't allow role updates unless admin
    if (!isAdmin && updateData.role) {
      delete updateData.role;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers({ role, search }, page = 1, limit = 20) {
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      users,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  /**
   * Delete a user
   */
  async deleteUser(userId, requesterId, isAdmin) {
    if (!isAdmin && userId !== requesterId) {
      throw new BadRequestError('Not authorized to delete this user');
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = stats.reduce((acc, curr) => acc + curr.count, 0);
    const activeUsers = stats.reduce((acc, curr) => acc + curr.activeUsers, 0);

    return { totalUsers, activeUsers, roleBreakdown: stats };
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Get nearby farmers
   */
  async getNearbyFarmers(latitude, longitude, radius = 10) {
    return await User.find({
      role: 'farmer',
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('name location ratings address');
  }

  /**
   * Get top rated farmers
   */
  async getTopFarmers(limit = 10) {
    return await User.find({
      role: 'farmer',
      status: 'active'
    })
    .select('name ratings address totalSales')
    .sort({ 
      'ratings.average': -1,
      totalSales: -1 
    })
    .limit(limit);
  }
}

module.exports = new UserService();
