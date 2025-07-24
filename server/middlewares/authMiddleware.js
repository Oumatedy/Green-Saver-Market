const { verifySession } = require('@clerk/express');
const User = require('../models/userModel');
const { UnauthorizedError } = require('../utils/appError');

/**
 * Authentication middleware to verify Clerk session token.
 * Sets req.user with user details if authenticated.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const session = await verifySession(token);

    if (!session) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Find user in DB by Clerk userId
    const user = await User.findOne({ clerkId: session.userId });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('User account is not active');
    }

    // Attach user data to request object
    req.user = {
      userId: user._id.toString(),
      clerkId: user.clerkId,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Factory for role-based access control middleware.
 * @param {Array<string>} allowedRoles - Roles allowed to proceed
 */
const requireRoles = (allowedRoles = []) => {
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

// Predefined role guards
const adminOnly = requireRoles(['admin']);
const farmersAndAdmin = requireRoles(['admin', 'farmer']);

/**
 * Middleware to ensure user is authenticated (no role checks).
 */
const authenticatedOnly = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  next();
};

module.exports = {
  authMiddleware,
  requireRoles,
  adminOnly,
  farmersAndAdmin,
  authenticatedOnly,
};
