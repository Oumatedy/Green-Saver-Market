import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserAPI, loginAPI, logoutAPI } from '../../services/api';

export const fetchUser = createAsyncThunk('user/fetchUser', async (userId) => {
  const response = await fetchUserAPI(userId);
  return response.data;
});

export const loginUser = createAsyncThunk('user/loginUser', async (credentials) => {
  const response = await loginAPI(credentials);
  return response.data;
});

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutAPI();
});

const initialState = {
  userInfo: null,
  loading: false,
  error: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload;
      state.isLoggedIn = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder  
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isLoggedIn = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isLoggedIn = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.isLoggedIn = false;
      });
  }
});

export const { clearUserError, setUserInfo } = userSlice.actions;

export default userSlice.reducer;
