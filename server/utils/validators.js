const { body, param, query } = require('express-validator');

const validateMongoId = paramName =>
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ID`);

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const validateSortOrder = queryName =>
  query(queryName)
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage(`${queryName} must be 'asc' or 'desc'`);

module.exports = {
  validateMongoId,
  validatePagination,
  validateSortOrder,
};
