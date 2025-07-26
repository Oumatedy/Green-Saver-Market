import apiClient from "./apiClient";

export async function fetchOrders(params = {}) {
  // params: filters (status, date range), pagination
  const response = await apiClient.get("/orders", { params });
  return response.data;
}

export async function fetchOrderById(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

export async function createOrder(orderData) {
  const response = await apiClient.post("/orders", orderData);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await apiClient.delete(`/orders/${orderId}`);
  return response.data;
}
