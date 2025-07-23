import { useAuth } from '@clerk/clerk-react';
import api from './api';

export const handleAuthToken = () => {
  const { getToken } = useAuth();
  
  // Set auth token in axios interceptor
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export const useClerkAuth = () => {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  
  return {
    isLoaded,
    isAuthenticated: !!userId,
    userId,
    sessionId,
    getToken,
  };
};
