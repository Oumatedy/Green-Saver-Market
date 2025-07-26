import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as apiService from '@/services/api';

export function useOrders(userId) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => apiService.getOrders(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiService.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => apiService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => apiService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Custom hook for order statistics (for admin dashboard)
export function useOrderStats() {
  return useQuery({
    queryKey: ['orderStats'],
    queryFn: () => apiService.getOrders(), // Fetch all orders for stats
    select: (data) => {
      const orders = data?.orders || [];

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = orders.filter(
        (order) => new Date(order.createdAt) > thirtyDaysAgo
      );

      return {
        totalOrders,
        totalRevenue,
        statusCounts,
        recentOrdersCount: recentOrders.length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
