import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
