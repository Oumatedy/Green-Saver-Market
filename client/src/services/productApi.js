import apiClient from "./apiClient";

export async function fetchProducts(params = {}) {
  // params can include filters, pagination, sorting, etc.
  const response = await apiClient.get("/products", { params });
  return response.data;
}

export async function fetchProductById(productId) {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
}

export async function createProduct(productData) {
  const response = await apiClient.post("/products", productData);
  return response.data;
}

export async function updateProduct(productId, productData) {
  const response = await apiClient.put(`/products/${productId}`, productData);
  return response.data;
}

export async function deleteProduct(productId) {
  const response = await apiClient.delete(`/products/${productId}`);
  return response.data;
}
