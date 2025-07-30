import React from 'react';
import { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../hooks/use-toast';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [userStats, orderStats, productStats] = await Promise.all([
        apiClient.get('/users/stats'),
        apiClient.get('/orders/stats'),
        apiClient.get('/products/stats')
      ]);

      setStats({
        users: userStats.data,
        orders: orderStats.data,
        products: productStats.data
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Stats */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Users</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-medium">{stats.users.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-medium">{stats.users.activeUsers}</span>
            </div>
            {stats.users.roleBreakdown.map(role => (
              <div key={role._id} className="flex justify-between">
                <span className="text-gray-600">{role._id}s</span>
                <span className="font-medium">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Stats */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Orders</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-medium">{stats.orders.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-medium">${stats.orders.totalRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-medium">${stats.orders.averageOrderValue}</span>
            </div>
          </div>
        </div>

        {/* Product Stats */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-medium">{stats.products.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Products</span>
              <span className="font-medium">{stats.products.activeProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-medium">{stats.products.outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts/Graphs can be added here */}
    </div>
  );
}
