import apiClient from "./apiClient";

// Fetch list of conversations for a user
export async function fetchConversations(userId) {
  const response = await apiClient.get(`/messages/conversations/${userId}`);
  return response.data;
}

// Fetch messages within a conversation
export async function fetchMessages(conversationId, params = {}) {
  const response = await apiClient.get(`/messages/conversation/${conversationId}`, { params });
  return response.data;
}

// Send a message
export async function sendMessage(conversationId, messageData) {
  // messageData = { senderId, content, timestamp? }
  const response = await apiClient.post(`/messages/conversation/${conversationId}`, messageData);
  return response.data;
}
