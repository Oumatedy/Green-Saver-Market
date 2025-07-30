import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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

// Helper function for form data handling
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

// Product API endpoints with error handling and response unwrapping
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    // Ensure we return the products array, not the entire response
    return response.data.data || response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data || { message: error.message };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const createProduct = async (data) => {
  try {
    const formData = buildProductFormData(data);
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const updateProduct = async (id, data) => {
  try {
    const formData = buildProductFormData(data);
    const response = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
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
