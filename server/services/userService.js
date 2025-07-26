const User = require('../models/userModel');
const { BadRequestError, NotFoundError } = require('../utils/appError');

class UserService {
  /**
   * Get a user by ID with access control:
   * - Admins can view full profile of any user.
   * - Normal users can only view their own full profile.
   * - Other user profiles return limited public info.
   * @param {string} userId - The user to retrieve
   * @param {string} requesterId - The requester user ID
   * @param {boolean} isAdmin - Does requester have admin rights
   * @returns {Promise<Object>} User data (full or limited)
   * @throws NotFoundError if user not found
   */
  async getUser(userId, requesterId, isAdmin = false) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!isAdmin && userId !== requesterId) {
      // Limited public profile for other users
      return {
        _id: user._id,
        name: user.name,
        role: user.role,
        ratings: user.ratings,
        location: user.location,
      };
    }

    // Full profile for self or admin
    return user;
  }

  /**
   * Update a user's profile with access control:
   * - Only admins or the user themselves can update.
   * - Roles cannot be updated by non-admins to prevent privilege escalation.
   * @param {string} userId - The user to update
   * @param {string} requesterId - The user making the request
   * @param {boolean} isAdmin - Does requester have admin rights
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user document
   * @throws BadRequestError if unauthorized or no update data
   * @throws NotFoundError if user not found
   */
  async updateUser(userId, requesterId, isAdmin, updateData) {
    if (!isAdmin && userId !== requesterId) {
      throw new BadRequestError('Not authorized to update this profile');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestError('No data provided for update');
    }

    // Prevent role changes by non-admins
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
   * Get all users with optional filtering and pagination
   * @param {Object} filters - Filtering options: role, search term
   * @param {string} filters.role - Filter by role ('user', 'admin', 'farmer')
   * @param {string} filters.search - Search term for name or email (case-insensitive)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of users per page
   * @returns {Promise<Object>} Paginated users data
   */
  async getAllUsers({ role, search }, page = 1, limit = 20) {
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
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
      total,
    };
  }

  /**
   * Delete a user with access control:
   * - Only self or admins can delete a user
   * @param {string} userId - User to delete
   * @param {string} requesterId - Requesting user ID
   * @param {boolean} isAdmin - Requester admin status
   * @returns {Promise<Object>} Deleted user document
   * @throws BadRequestError if unauthorized
   * @throws NotFoundError if user not found
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
   * Get aggregated user statistics grouped by role and active status
   * @returns {Promise<Object>} Totals and breakdown by role/status
   */
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
    ]);

    const totalUsers = stats.reduce((acc, curr) => acc + curr.count, 0);
    const activeUsers = stats.reduce((acc, curr) => acc + curr.activeUsers, 0);

    return { totalUsers, activeUsers, roleBreakdown: stats };
  }

  /**
   * Update a user's status (e.g., active, suspended)
   * @param {string} userId 
   * @param {string} status 
   * @returns {Promise<Object>} Updated user document
   * @throws NotFoundError if user does not exist
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
   * Get nearby farmers given geographic coordinates
   * Uses geospatial queries (make sure 'location' field is indexed with 2dsphere)
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} radius - search radius in kilometers (default 10km)
   * @returns {Promise<Array>} List of nearby farmers with selected fields
   */
  async getNearbyFarmers(latitude, longitude, radius = 10) {
    return User.find({
      role: 'farmer',
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radius * 1000, // Meters
        },
      },
    }).select('name location ratings address');
  }

  /**
   * Get top rated farmers ordered by average rating and total sales
   * @param {number} limit - number of farmers to return (default 10)
   * @returns {Promise<Array>} List of farmers
   */
  async getTopFarmers(limit = 10) {
    return User.find({ role: 'farmer', status: 'active' })
      .select('name ratings address totalSales')
      .sort({ 'ratings.average': -1, totalSales: -1 })
      .limit(limit);
  }
}

module.exports = new UserService();
