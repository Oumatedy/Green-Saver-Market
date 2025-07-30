import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
  const { data: products = [], isLoading, error, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    select: (data) => Array.isArray(data) ? data : [],
    retry: 1,
    onError: (error) => {
      console.error('Error fetching products:', error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">
          Failed to load products. {error?.message || 'Please try again later.'}
        </div>
        <button
          onClick={() => queryClient.invalidateQueries(['products'])}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Error: {error.message || 'Failed to load products'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
        {products?.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
