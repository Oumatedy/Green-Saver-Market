import apiClient from "./apiClient";

export async function loginUser(credentials) {
  // credentials = { email, password }
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function registerUser(userInfo) {
  // userInfo = { name, email, password, role, ...}
  const response = await apiClient.post("/auth/register", userInfo);
  return response.data;
}

export async function logoutUser() {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}
