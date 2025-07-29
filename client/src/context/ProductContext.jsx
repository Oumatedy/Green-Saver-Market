import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getProducts } from '@/services/api';

const ProductContext = createContext();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const ProductProvider = ({ children }) => {
  const contextValue = {
    queryClient,
    invalidateProducts: () => queryClient.invalidateQueries(['products']),
    prefetchProducts: () => queryClient.prefetchQuery(['products'], () => getProducts()),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ProductContext.Provider value={contextValue}>
        {children}
      </ProductContext.Provider>
    </QueryClientProvider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
