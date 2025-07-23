import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (userId) => {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ userId, otherUserId, page = 1 }) => {
    const response = await api.get(`/messages/${userId}/${otherUserId}`, {
      params: { page }
    });
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: {},
    activeConversation: null,
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { from, to, message, timestamp } = action.payload;
      const conversationId = from < to ? `${from}-${to}` : `${to}-${from}`;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      state.messages[conversationId].push({
        senderId: from,
        content: message,
        timestamp
      });

      // Update unread count if not in active conversation
      if (state.activeConversation !== conversationId) {
        state.unreadCount += 1;
      }
    },
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
        state.unreadCount = Math.max(0, state.unreadCount - conversation.unreadCount);
      }
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.conversations = state.conversations.map(conv => {
        if (conv.userId === userId) {
          return { ...conv, online: status === 'online' };
        }
        return conv;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.unreadCount = action.payload.reduce(
          (total, conv) => total + (conv.unreadCount || 0),
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, page } = action.payload;
        if (page === 1) {
          state.messages[conversationId] = messages;
        } else {
          state.messages[conversationId] = [
            ...messages,
            ...(state.messages[conversationId] || [])
          ];
        }
      });
  }
});

export const {
  setActiveConversation,
  addMessage,
  markConversationAsRead,
  updateUserStatus
} = chatSlice.actions;

export default chatSlice.reducer;
