const { BadRequestError } = require('./appError');
const { validCategories } = require('./constants');

/**
 * Validate product category
 * @param {string} category 
 */
function validateCategory(category) {
  if (!validCategories.includes(category)) {
    throw new BadRequestError(`Category '${category}' is not valid`);
  }
  return category;
}

/**
 * Sanitize product data before saving (example)
 * @param {Object} productData 
 */
function sanitizeProductData(productData) {
  // Example: trim strings, enforce numeric prices
  if (productData.name) productData.name = productData.name.trim();
  if (productData.description) productData.description = productData.description.trim();

  productData.price = Number(productData.price);
  if (isNaN(productData.price) || productData.price < 0) {
    throw new BadRequestError('Price must be a non-negative number');
  }

  return productData;
}

module.exports = {
  validateCategory,
  sanitizeProductData,
};
