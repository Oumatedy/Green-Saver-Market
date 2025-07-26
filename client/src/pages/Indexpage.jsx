import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Index = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isLoaded && user) {
      const role = searchParams.get('role') || 'customer';
      navigate(`/dashboard?role=${role}`);
    }
  }, [isLoaded, user, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Green Saver Market...</p>
      </div>
    </div>
  );
};

export default Index;