const { validationResult, matchedData } = require('express-validator');
const { BadRequestError } = require('../utils/AppError');

/**
 * Middleware to validate request data based on validation rules
 * @param {Object} options - Validation options
 * @param {boolean} options.stopOnFirstError - Whether to stop on first error or collect all errors
 * @param {boolean} options.sanitize - Whether to sanitize and filter request data
 * @returns {Function} Express middleware function
 */
const validate = (options = {}) => {
  const { stopOnFirstError = false, sanitize = true } = options;

  return (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
        location: err.location
      }));

      throw new BadRequestError(
        'Validation failed',
        stopOnFirstError ? [errorMessages[0]] : errorMessages
      );
    }

    // Sanitize and filter request data if enabled
    if (sanitize) {
      // Get only the validated and sanitized data
      const sanitizedBody = matchedData(req, { 
        locations: ['body'],
        includeOptionals: true 
      });
      const sanitizedQuery = matchedData(req, { 
        locations: ['query'],
        includeOptionals: true 
      });
      const sanitizedParams = matchedData(req, { 
        locations: ['params'],
        includeOptionals: true 
      });

      // Replace request data with sanitized versions
      req.body = sanitizedBody;
      req.query = sanitizedQuery;
      req.params = sanitizedParams;
    }

    next();
  };
};
const sanitizeQuery = (req, res, next) => {
  if (req.query.page) req.query.page = parseInt(req.query.page);
  if (req.query.limit) req.query.limit = parseInt(req.query.limit);
  if (req.query.sortOrder) req.query.sortOrder = parseInt(req.query.sortOrder);
  next();
};

/**
 * Validation rules for pagination parameters
 */
const paginationRules = {
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page number must be a positive integer'
    },
    toInt: true
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100'
    },
    toInt: true
  }
};

/**
 * Validation rules for sorting parameters
 */
const sortingRules = {
  sortBy: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [['createdAt', 'total', 'status', 'orderId']],
      errorMessage: 'Invalid sort field'
    }
  },
  sortOrder: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [[-1, 1, '-1', '1']],
      errorMessage: 'Sort order must be either 1 or -1'
    },
    toInt: true
  }
};

/**
 * Validation rules for date range parameters
 */
const dateRangeRules = {
  'dateRange.start': {
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'Start date must be a valid ISO 8601 date'
    }
  },
  'dateRange.end': {
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'End date must be a valid ISO 8601 date'
    },
    custom: {
      options: (value, { req }) => {
        if (!req.body.dateRange?.start) return true;
        return new Date(value) >= new Date(req.body.dateRange.start);
      },
      errorMessage: 'End date must be after or equal to start date'
    }
  }
};

/**
 * Validation rules for export parameters
 */
const exportRules = {
  format: {
    in: ['body'],
    exists: {
      errorMessage: 'Export format is required'
    },
    isIn: {
      options: [['csv', 'json']],
      errorMessage: 'Invalid export format. Must be either csv or json'
    }
  },
  ...dateRangeRules
};

/**
 * Validation rules for admin order operations
 */
const adminOrderRules = {
  getOrders: [...Object.values(paginationRules), ...Object.values(sortingRules)],
  exportOrders: Object.values(exportRules)
};

module.exports = {
  validate,
  sanitizeQuery,
  adminOrderRules
};
