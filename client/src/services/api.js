import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  const formData = new FormData();
  
  // Handle images
  if (data.images) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  // Handle JSON fields
  ['seasonality', 'nutritionalInfo', 'origin', 'bulkPricing'].forEach((field) => {
    if (data[field]) {
      formData.append(field, JSON.stringify(data[field]));
    }
  });

  // Handle other fields
  Object.keys(data).forEach((key) => {
    if (!['images', 'seasonality', 'nutritionalInfo', 'origin', 'bulkPricing'].includes(key)) {
      formData.append(key, data[key]);
    }
  });

  return api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = (id, data) => {
  const formData = new FormData();
  
  // Handle images
  if (data.images) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  // Handle JSON fields
  ['seasonality', 'nutritionalInfo', 'origin', 'bulkPricing'].forEach((field) => {
    if (data[field]) {
      formData.append(field, JSON.stringify(data[field]));
    }
  });

  // Handle other fields
  Object.keys(data).forEach((key) => {
    if (!['images', 'seasonality', 'nutritionalInfo', 'origin', 'bulkPricing'].includes(key)) {
      formData.append(key, data[key]);
    }
  });

  return api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addProductReview = (id, data) => {
  const formData = new FormData();
  
  if (data.images) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  
  formData.append('rating', data.rating);
  formData.append('comment', data.comment);

  return api.post(`/products/${id}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getProductAnalytics = () => api.get('/products/analytics');

// Orders
export const getOrders = () => api.get('/orders');
export const getUserOrders = () => api.get('/orders/user');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Users
export const getCurrentUser = () => api.get('/users/me');
export const updateUser = (data) => api.put('/users', data);

// Payments
export const createPaymentIntent = (amount) => api.post('/payments/create-payment-intent', { amount });
export const createPayment = (data) => api.post('/payments', data);

export default api;
