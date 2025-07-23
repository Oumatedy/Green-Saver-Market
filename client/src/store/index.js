import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import socketReducer from './slices/socketSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'user'] // Only persist cart and user data
};

const makeStore = () => {
  const store = configureStore({
    reducer: {
      products: persistReducer(persistConfig, productReducer),
      orders: orderReducer,
      user: persistReducer(persistConfig, userReducer),
      cart: persistReducer(persistConfig, cartReducer),
      socket: socketReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST']
        }
      })
  });

  const persistor = persistStore(store);

  return { store, persistor };
};

export const { store, persistor } = makeStore();
