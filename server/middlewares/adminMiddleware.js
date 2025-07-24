const { ForbiddenError } = require('../utils/appError');

/**
 * Middleware to ensure the user is authenticated and has admin role
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      // Throwing ForbiddenError to be caught by error handler middleware
      throw new ForbiddenError('Admin access required');
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
