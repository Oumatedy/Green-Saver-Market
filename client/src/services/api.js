import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function buildProductFormData(data) {
  const formData = new FormData();

  if (data.images?.length) {
    data.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const jsonFields = ['seasonality', 'nutritionalInfo', 'origin', 'bulkPricing'];

  jsonFields.forEach((field) => {
    if (data[field] !== undefined) {
      formData.append(field, JSON.stringify(data[field]));
    }
  });

  Object.keys(data).forEach((key) => {
    if (!jsonFields.includes(key) && key !== 'images' && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return formData;
}

// Product APIs
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  const formData = buildProductFormData(data);
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateProduct = (id, data) => {
  const formData = buildProductFormData(data);
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addProductReview = (productId, data) => {
  const formData = new FormData();
  if (data.images?.length) {
    data.images.forEach((image) => formData.append('images', image));
  }
  if (data.rating !== undefined) formData.append('rating', data.rating);
  if (data.comment !== undefined) formData.append('comment', data.comment);

  return api.post(`/products/${productId}/reviews`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getProductAnalytics = () => api.get('/products/analytics');

// Order APIs
export const getOrders = () => api.get('/orders');
export const getUserOrders = () => api.get('/orders/user');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data); // <== ✅ Needed for orderSlice.js
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// User APIs
export const getCurrentUser = () => api.get('/users/me'); // Used in several slices
export const updateUser = (data) => api.put('/users', data);
export const fetchUserAPI = () => api.get('/users/me'); // Redundant but solves import mismatch

// Payment APIs
export const createPaymentIntent = (amount) => api.post('/payments/create-payment-intent', { amount });
export const createPayment = (data) => api.post('/payments', data);

// Auth APIs
export const loginAPI = (credentials) => api.post('/auth/login', credentials);
export const logoutAPI = () => api.post('/auth/logout');

export default api;
