const { CustomError } = require('../utils/appError');

/**
 * Middleware to catch all undefined routes (404 not found)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    name: err.name,
    code: err.code || err.statusCode || err.status,
  });

  // Handle custom application errors (your defined class)
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      code: err.code || null,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      type: e.kind,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
      code: 'VALIDATION_ERROR',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_KEY',
      field,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      code: 'INVALID_ID',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Multer errors (file upload errors)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'FILE_UPLOAD_ERROR',
      field: err.field,
    });
  }

  // Clerk authentication or authorization errors (assuming err.status 401)
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Authentication failed',
      code: err.code || 'UNAUTHORIZED',
    });
  }

  // Fallback to generic error response
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async wrapper to catch errors in async route handlers/middlewares
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
