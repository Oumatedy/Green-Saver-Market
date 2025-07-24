const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('./constants');

// Standard API response formatter
const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// List response formatter with pagination
const createPaginatedResponse = (items, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasMore: page < totalPages
      }
    },
    timestamp: new Date().toISOString()
  };
};

// Error response formatter
const createErrorResponse = (errorCode, message = null) => {
  return {
    success: false,
    error: {
      code: errorCode,
      message: message || ERROR_MESSAGES[errorCode] || 'An error occurred'
    },
    timestamp: new Date().toISOString()
  };
};

// Success response formatter
const createSuccessResponse = (action, data = null) => {
  return {
    success: true,
    message: SUCCESS_MESSAGES[action],
    data,
    timestamp: new Date().toISOString()
  };
};

// Validation error formatter
const createValidationErrorResponse = (errors) => {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors
    },
    timestamp: new Date().toISOString()
  };
};

// Analytics response formatter
const formatAnalyticsResponse = (data, period) => {
  return {
    success: true,
    data: {
      metrics: data,
      period,
      generatedAt: new Date().toISOString()
    }
  };
};

module.exports = {
  createResponse,
  createPaginatedResponse,
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
  formatAnalyticsResponse
};
