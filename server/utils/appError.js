class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode || 500;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
};
