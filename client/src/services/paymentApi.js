import apiClient from "./apiClient";

export async function createPayment(paymentData) {
  // paymentData may include orderId, amount, paymentMethod, etc.
  const response = await apiClient.post("/payments", paymentData);
  return response.data;
}

export async function fetchPaymentHistory(userId, params = {}) {
  const response = await apiClient.get(`/payments/user/${userId}`, { params });
  return response.data;
}
