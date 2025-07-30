const { ForbiddenError } = require('../utils/appError');

/**
 * Middleware factory for role-based access control
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

/**
 * Guards routes to only allow users accessing their own resources
 * unless they are admins
 * @param {Function} paramIdSelector - Function to select the relevant ID from req.params
 */
const requireOwnership = (paramIdSelector = (req) => req.params.userId) => {
  return (req, res, next) => {
    const resourceId = paramIdSelector(req);
    
    if (req.user.role === 'admin') {
      return next(); // Admins can access all resources
    }

    if (req.user._id.toString() !== resourceId) {
      return next(new ForbiddenError('You can only access your own resources'));
    }

    next();
  };
};

module.exports = {
  requireRole,
  requireOwnership
};
