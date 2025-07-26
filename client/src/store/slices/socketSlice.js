import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  messages: [], // array of chat or notification messages
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected(state, action) {
      state.connected = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { setConnected, addMessage, clearMessages, setError, clearError } = socketSlice.actions;

export default socketSlice.reducer;
