import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Components
import UserList from '@/containers/UserList';
import OrderList from '@/containers/OrderList';
import ProductList from '@/containers/ProductList';
import Analytics from '@/components/dashboards/Analytics';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <nav className="space-y-2">
            <button onClick={() => navigate('users')} className="w-full text-left p-2 hover:bg-green-50 rounded">
              Users
            </button>
            <button onClick={() => navigate('orders')} className="w-full text-left p-2 hover:bg-green-50 rounded">
              Orders
            </button>
            <button onClick={() => navigate('products')} className="w-full text-left p-2 hover:bg-green-50 rounded">
              Products
            </button>
            <button onClick={() => navigate('analytics')} className="w-full text-left p-2 hover:bg-green-50 rounded">
              Analytics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9">
          <Routes>
            <Route path="users" element={<UserList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="/" element={<Navigate to="analytics" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
