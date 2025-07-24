const { validationResult, matchedData } = require('express-validator');
const { BadRequestError } = require('../utils/appError');

/**
 * Middleware factory to validate requests based on express-validator rules.
 * Throws BadRequestError containing all errors or stops on first error as configured.
 * Optionally sanitizes and replaces req.body, req.query, and req.params with validated data.
 * 
 * @param {Object} options
 * @param {boolean} options.stopOnFirstError - If true, returns only the first validation error.
 * @param {boolean} options.sanitize - If true, replaces req.* with sanitized data.
 * @returns {Function} Express middleware
 */
const validate = (options = {}) => {
  const { stopOnFirstError = false, sanitize = true } = options;

  return (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Prepare error messages array
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
        location: err.location,
      }));

      // Throw validation error using your custom error class
      throw new BadRequestError(
        'Validation failed',
        stopOnFirstError ? [errorMessages[0]] : errorMessages
      );
    }

    if (sanitize) {
      // Replace req.body, req.query, and req.params with only validated and sanitized fields
      req.body = matchedData(req, { locations: ['body'], includeOptionals: true });
      req.query = matchedData(req, { locations: ['query'], includeOptionals: true });
      req.params = matchedData(req, { locations: ['params'], includeOptionals: true });
    }

    next();
  };
};

/**
 * Middleware to parse certain query parameters explicitly to integers.
 * Should be applied after validation middleware if query params are expected.
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query.page !== undefined) req.query.page = parseInt(req.query.page, 10);
  if (req.query.limit !== undefined) req.query.limit = parseInt(req.query.limit, 10);
  if (req.query.sortOrder !== undefined) req.query.sortOrder = parseInt(req.query.sortOrder, 10);
  
  next();
};

/**
 * Validation chain rules for pagination parameters.
 * Page defaults to 1, Limit capped between 1 and 100.
 */
const paginationRules = {
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page number must be a positive integer',
    },
    toInt: true,
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be between 1 and 100',
    },
    toInt: true,
  },
};

/**
 * Validation chain rules for sorting parameters.
 * sortBy must be among allowed fields (adjust as per your app schema).
 * sortOrder must be either 1 or -1 (or string equivalents).
 */
const sortingRules = {
  sortBy: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [['createdAt', 'total', 'status', 'orderId']], // adjust allowed fields per feature
      errorMessage: 'Invalid sort field',
    },
  },
  sortOrder: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [[1, -1, '1', '-1']],
      errorMessage: 'Sort order must be either 1 or -1',
    },
    toInt: true,
  },
};

/**
 * Validation rules for date range input in the request body.
 * Ensures ISO8601 date format and that end date is after or equal to start date.
 */
const dateRangeRules = {
  'dateRange.start': {
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'Start date must be a valid ISO 8601 date',
    },
  },
  'dateRange.end': {
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'End date must be a valid ISO 8601 date',
    },
    custom: {
      options: (value, { req }) => {
        if (!req.body.dateRange?.start) {
          return true;
        }
        return new Date(value) >= new Date(req.body.dateRange.start);
      },
      errorMessage: 'End date must be after or equal to start date',
    },
  },
};

/**
 * Validation rules for export operation inputs.
 * Format must be 'csv' or 'json'.
 * Supports optional dateRange fields.
 */
const exportRules = {
  format: {
    in: ['body'],
    exists: {
      errorMessage: 'Export format is required',
    },
    isIn: {
      options: [['csv', 'json']],
      errorMessage: 'Invalid export format. Must be either csv or json',
    },
  },
  ...dateRangeRules,
};

/**
 * Aggregated validation rules configured for admin order-related endpoints.
 * Example:
 * - getOrders expects pagination and sorting query params.
 * - exportOrders expects body params with export format and date ranges.
 */
const adminOrderRules = {
  getOrders: [...Object.values(paginationRules), ...Object.values(sortingRules)],
  exportOrders: Object.values(exportRules),
};

module.exports = {
  validate,
  sanitizeQuery,
  paginationRules,
  sortingRules,
  dateRangeRules,
  exportRules,
  adminOrderRules,
};
