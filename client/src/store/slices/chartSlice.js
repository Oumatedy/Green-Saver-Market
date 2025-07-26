import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchChartDataAPI } from '../Services/api';

export const fetchChartData = createAsyncThunk('chart/fetchChartData', async (params) => {
  const response = await fetchChartDataAPI(params);
  return response.data;
});

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    clearChartData(state) {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearChartData } = chartSlice.actions;

export default chartSlice.reducer;
