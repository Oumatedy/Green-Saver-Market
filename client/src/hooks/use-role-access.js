import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export const useRoleAccess = (allowedRoles = []) => {
  const { user, isLoaded } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isLoaded) return;

      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userData.role);

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on user's role
          navigate(authService.getDashboardRoute(userData.role));
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Failed to check authorization:', error);
        navigate('/auth');
      }
    };

    checkAuthorization();
  }, [user, isLoaded, allowedRoles, navigate]);

  return { isAuthorized, isLoaded };
};

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setRole(userData.role);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(null);
      }
    };

    fetchRole();
  }, [user]);

  return role;
};
