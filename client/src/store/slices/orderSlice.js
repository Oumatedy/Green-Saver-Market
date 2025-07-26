import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOrders,
  createOrder as createOrderAPI,
  updateOrderStatus,
  deleteOrder as deleteOrderAPI,
} from '@/services/api';

// Thunks
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await getOrders();
  return response.data;
});

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData) => {
  const response = await createOrderAPI(orderData);
  return response.data;
});

export const updateOrder = createAsyncThunk('orders/updateOrder', async ({ id, status }) => {
  const response = await updateOrderStatus(id, status);
  return response.data;
});

export const deleteOrder = createAsyncThunk('orders/deleteOrder', async (id) => {
  await deleteOrderAPI(id);
  return id;
});

// Slice
const initialState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = orderSlice.actions;

export default orderSlice.reducer;
