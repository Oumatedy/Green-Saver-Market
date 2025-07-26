import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import OrderSummary from '../components/OrderSummary';

const OrderDetails = () => {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Error: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        Order not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>
      <OrderSummary order={order} />
    </div>
  );
};

export default OrderDetails;
