import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { authService } from '@/services/auth';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles = [], userRole }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || userRole === null) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={authService.getDashboardRoute(userRole)} replace />;
  }

  return children;
};

const AuthRedirect = ({ userRole }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || userRole === null) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={authService.getDashboardRoute(userRole)} replace />;
};

export { ProtectedRoute, AuthRedirect };
export default ProtectedRoute;
