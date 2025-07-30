import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';

const getDashboardByRole = (role) => {
  switch (role) {
    case 'customer':
      return '/dashboard/customer';
    case 'farmer':
      return '/dashboard/farmer';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/auth';
  }
};

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn) {
        try {
          const response = await apiClient.get('/users/me');
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      }
      setIsLoading(false);
    };

    if (isLoaded) {
      fetchUserRole();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardByRole(userRole)} replace />;
  }

  return children;
}

export function AuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn) {
        try {
          const response = await apiClient.get('/users/me');
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      }
      setIsLoading(false);
    };

    if (isLoaded) {
      fetchUserRole();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={getDashboardByRole(userRole)} replace />;
}

export default ProtectedRoute;
