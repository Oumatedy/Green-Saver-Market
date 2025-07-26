export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  CUSTOMER: "customer",
  FARMER: "farmer",
  ADMIN: "admin",
};

export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Bakery',
  'Beverages',
  "Herbs",
  "Grains",
  "Other",
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
};

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
};

export const API_RESPONSE_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "Requested resource not found.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
};