import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { authService } from '@/services/auth';

export function ProtectedRoute({ children, allowedRoles = [], userRole }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={authService.getDashboardRoute(userRole)} replace />;
  }

  return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(fetchedUserRole)) {
    return <Navigate to={getDashboardByRole(fetchedUserRole)} replace />;
  }

  return children;
}

export function AuthRedirect({ userRole }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [fetchedUserRole, setUserRole] = useState(null);
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

  if (!isLoaded || userRole === null) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={getDashboardByRole(fetchedUserRole)} replace />;
}

export default ProtectedRoute;
