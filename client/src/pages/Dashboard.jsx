import { useUser } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import FarmerDashboard from '../components/dashboards/FarmerDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [searchParams] = useSearchParams();
  const userRole = searchParams.get('role') || 'customer';

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}