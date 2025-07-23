// Database constants
const DB_CONSTANTS = {
  COLLECTIONS: {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    PAYMENTS: 'payments'
  },
  CONNECTION_TIMEOUT: 30000,
  MAX_POOL_SIZE: 10
};

// User roles and permissions
const USER_ROLES = {
  CUSTOMER: 'customer',
  FARMER: 'farmer',
  ADMIN: 'admin'
};

const PERMISSIONS = {
  [USER_ROLES.CUSTOMER]: [
    'view_products',
    'create_order',
    'view_own_orders',
    'update_own_profile'
  ],
  [USER_ROLES.FARMER]: [
    'view_products',
    'create_product',
    'update_own_products',
    'view_own_orders',
    'update_order_status',
    'update_own_profile'
  ],
  [USER_ROLES.ADMIN]: [
    'view_all_products',
    'manage_products',
    'view_all_orders',
    'manage_orders',
    'view_all_users',
    'manage_users',
    'view_analytics',
    'manage_payments'
  ]
};

// Product categories
const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Herbs',
  'Grains',
  'Dairy',
  'Meat',
  'Seafood',
  'Baked Goods',
  'Preserves',
  'Beverages'
];

// Order statuses
const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment statuses
const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment methods
const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer'
};

// Shipping methods
const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight'
};

// Shipping rates
const SHIPPING_RATES = {
  [SHIPPING_METHODS.STANDARD]: 5.99,
  [SHIPPING_METHODS.EXPRESS]: 12.99,
  [SHIPPING_METHODS.OVERNIGHT]: 24.99
};

// Business rules
const BUSINESS_RULES = {
  FREE_SHIPPING_THRESHOLD: 30.00,
  TAX_RATE: 0.08,
  MAX_CART_ITEMS: 50,
  MAX_PRODUCT_IMAGES: 5,
  LOW_STOCK_THRESHOLD: 10,
  ORDER_CANCELLATION_WINDOW: 30 * 60 * 1000, // 30 minutes in milliseconds
  PASSWORD_MIN_LENGTH: 8
};

// File upload constraints
const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGE_DIMENSIONS: {
    WIDTH: 2048,
    HEIGHT: 2048
  }
};

// API rate limiting
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  SEARCH: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX_REQUESTS: 30
  }
};

// Email templates
const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  REFUND_PROCESSED: 'refund_processed',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset'
};

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  STOCK_LOW: 'stock_low',
  NEW_REVIEW: 'new_review'
};

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANNOT_BE_CANCELLED: 'ORDER_CANNOT_BE_CANCELLED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// Success messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User account created successfully',
  USER_UPDATED: 'User profile updated successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  ORDER_CREATED: 'Order placed successfully',
  ORDER_UPDATED: 'Order status updated successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  REFUND_PROCESSED: 'Refund processed successfully'
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  ORDER_NOT_FOUND: 'Order not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  INVALID_INPUT: 'Invalid input data',
  DUPLICATE_EMAIL: 'Email address already exists',
  INSUFFICIENT_STOCK: 'Insufficient stock for requested quantity',
  PAYMENT_FAILED: 'Payment processing failed',
  ORDER_ALREADY_CANCELLED: 'Order has already been cancelled',
  CANCELLATION_WINDOW_EXPIRED: 'Order cancellation window has expired'
};

// Measurement units
const MEASUREMENT_UNITS = [
  'lb',   // pound
  'oz',   // ounce
  'kg',   // kilogram
  'g',    // gram
  'piece',
  'bunch',
  'bag',
  'box',
  'dozen'
];

// Time constants
const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
};

module.exports = {
  DB_CONSTANTS,
  USER_ROLES,
  PERMISSIONS,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
  SHIPPING_RATES,
  BUSINESS_RULES,
  FILE_CONSTRAINTS,
  RATE_LIMITS,
  EMAIL_TEMPLATES,
  NOTIFICATION_TYPES,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  MEASUREMENT_UNITS,
  TIME_CONSTANTS
};