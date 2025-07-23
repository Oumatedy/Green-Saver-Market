const crypto = require('crypto');

// Generate random string
function generateRandomString(length = 8) {
  return crypto.randomBytes(length).toString('hex');
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Sanitize user input
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Paginate results
function paginate(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
}

// Create slug from string
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Calculate estimated delivery date
function calculateDeliveryDate(orderDate, shippingMethod = 'standard') {
  const date = new Date(orderDate);
  
  const deliveryDays = {
    standard: 3,
    express: 1,
    overnight: 0
  };
  
  const daysToAdd = deliveryDays[shippingMethod] || 3;
  date.setDate(date.getDate() + daysToAdd);
  
  // Skip weekends for standard delivery
  if (shippingMethod === 'standard') {
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
  }
  
  return date;
}

// Generate order confirmation number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GSM-${timestamp}-${random}`.toUpperCase();
}

// Calculate tax amount
function calculateTax(amount, taxRate = 0.08) {
  return Math.round(amount * taxRate * 100) / 100;
}

// Calculate shipping cost
function calculateShipping(items, shippingMethod = 'standard', freeShippingThreshold = 30) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  
  const shippingRates = {
    standard: 5.99,
    express: 12.99,
    overnight: 24.99
  };
  
  return shippingRates[shippingMethod] || shippingRates.standard;
}

// Validate required fields
function validateRequiredFields(obj, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
      missing.push(field);
    }
  }
  
  return missing;
}

// Generate API response
function createResponse(success, message, data = null, errors = null) {
  const response = { success, message };
  
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  
  return response;
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Get file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// Check if file type is allowed
function isAllowedFileType(filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']) {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
}

// Convert bytes to human readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Retry function with exponential backoff
async function retry(fn, maxRetries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, maxRetries - 1, delay * 2);
  }
}

module.exports = {
  generateRandomString,
  formatCurrency,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  calculateDistance,
  paginate,
  createSlug,
  calculateDeliveryDate,
  generateOrderNumber,
  calculateTax,
  calculateShipping,
  validateRequiredFields,
  createResponse,
  deepClone,
  getFileExtension,
  isAllowedFileType,
  formatBytes,
  retry
};