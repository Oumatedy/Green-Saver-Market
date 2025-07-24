const { verifySession } = require('@clerk/express');
const User = require('../models/userModel');
const { UnauthorizedError } = require('../utils/AppError');

/**
 * Authentication middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const session = await verifySession(token);
    if (!session) {
      throw new UnauthorizedError('Invalid token');
    }

    const user = await User.findOne({ clerkId: session.userId });
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    req.user = {
      userId: user._id,
      clerkId: user.clerkId,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 */
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common role middleware combinations
const adminOnly = requireRoles(['admin']);
const farmersAndAdmin = requireRoles(['admin', 'farmer']);
const authenticatedOnly = (req, res, next) => next();

// ✅ Proper export
module.exports = {
  authMiddleware,
  requireRoles,
  adminOnly,
  farmersAndAdmin,
  authenticatedOnly
};
