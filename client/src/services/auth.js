import apiClient from './apiClient';

export const authService = {
  // Initialize user session and handle role-based navigation
  async initializeSession(clerkUser, role) {
    try {
      const token = await clerkUser.getToken();
      localStorage.setItem('accessToken', token);
      
      // Send user data to backend to create/update user
      const response = await apiClient.post('/users/initialize', {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: role // Include selected role
      });
      
      // Store role in localStorage for quick access
      localStorage.setItem('userRole', response.data.role);
      
      return response.data;
    } catch (error) {
      console.error('Failed to initialize session:', error);
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

  // Get current user profile
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
