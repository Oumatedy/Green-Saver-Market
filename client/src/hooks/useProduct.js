import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as apiService from '@/services/api';  

// Hook to fetch products with optional filters
export function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a single product by id
export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProductById(id),  // Fix function name here
    enabled: !!id,
  });
}

// Hook to create a new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => apiService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Hook to update an existing product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Hook to delete a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Custom hook for product search with debouncing
export function useProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with search filter applied
  const { data, isLoading, error } = useProducts({
    search: debouncedSearchTerm,
  });

  return {
    searchTerm,
    setSearchTerm,
    products: data?.products || [],
    isLoading,
    error,
  };
}
