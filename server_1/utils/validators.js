const { 
  PRODUCT_CATEGORIES, 
  MEASUREMENT_UNITS, 
  BUSINESS_RULES,
  FILE_CONSTRAINTS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  USER_ROLES
} = require('./constants');

// Product validation
const validateProduct = (productData) => {
  const errors = [];

  if (!productData.name || productData.name.length < 3) {
    errors.push('Product name must be at least 3 characters long');
  }

  if (!productData.description || productData.description.length < 10) {
    errors.push('Product description must be at least 10 characters long');
  }

  if (!productData.price || productData.price <= 0) {
    errors.push('Product price must be greater than 0');
  }

  if (!productData.category || !PRODUCT_CATEGORIES.includes(productData.category)) {
    errors.push('Invalid product category');
  }

  if (!productData.unit || !MEASUREMENT_UNITS.includes(productData.unit)) {
    errors.push('Invalid measurement unit');
  }

  if (productData.stockQuantity < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  return errors;
};

// Order validation
const validateOrder = (orderData) => {
  const errors = [];

  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (orderData.items && orderData.items.length > BUSINESS_RULES.MAX_CART_ITEMS) {
    errors.push(`Cannot exceed ${BUSINESS_RULES.MAX_CART_ITEMS} items per order`);
  }

  if (!orderData.shippingAddress || !orderData.shippingAddress.address) {
    errors.push('Shipping address is required');
  }

  return errors;
};

// File validation
const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('File is required');
    return errors;
  }

  if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
    errors.push('File size exceeds maximum limit');
  }

  if (!FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    errors.push('Invalid file type');
  }

  return errors;
};

// Order status transition validation
const validateOrderStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
    [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PREPARING, ORDER_STATUSES.CANCELLED],
    [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.SHIPPED],
    [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
    [ORDER_STATUSES.DELIVERED]: [],
    [ORDER_STATUSES.CANCELLED]: []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Payment method validation
const validatePaymentMethod = (method, amount) => {
  const errors = [];

  if (!PAYMENT_METHODS[method.toUpperCase()]) {
    errors.push('Invalid payment method');
  }

  if (!amount || amount <= 0) {
    errors.push('Invalid payment amount');
  }

  return errors;
};

// User role validation
const validateUserRole = (role, action, resource) => {
  if (!USER_ROLES[role.toUpperCase()]) {
    return false;
  }

  const userPermissions = PERMISSIONS[role];
  return userPermissions.includes(`${action}_${resource}`);
};

module.exports = {
  validateProduct,
  validateOrder,
  validateFile,
  validateOrderStatusTransition,
  validatePaymentMethod,
  validateUserRole
};
