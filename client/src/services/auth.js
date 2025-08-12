import apiClient from './apiClient';

export const authService = {
  // Initialize user session and handle role-based navigation
  async initializeSession(user, getToken) {
    try {
      // Get the token from Clerk session
      const token = await getToken();
      localStorage.setItem('accessToken', token);
      
      // Get the selected role from localStorage or default to customer
      const selectedRole = localStorage.getItem('selectedRole') || 'customer';
      
      // Send user data to backend to create/update user
      const response = await apiClient.post('/users/initialize', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: selectedRole
      });
      
      // Store role in localStorage for quick access
      localStorage.setItem('userRole', response.data.role);
      
      return response.data;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    }
  },

  // Get current user profile from our backend
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Get dashboard route based on user role
  getDashboardRoute(role) {
    const routes = {
      customer: '/dashboard/customer',
      farmer: '/dashboard/farmer',
      admin: '/dashboard/admin'
    };
    return routes[role] || '/auth';
  },
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Get authentication status
  async checkAuth() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      throw error;
    }
  }
};
