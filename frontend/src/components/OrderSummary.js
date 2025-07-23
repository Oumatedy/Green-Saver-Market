import React from 'react';
import { formatPrice } from '../utils/helpers';

const OrderSummary = ({ order }) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid, isDelivered } = order;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Items</h3>
        {orderItems.map((item) => (
          <div key={item._id} className="flex justify-between mb-2">
            <span>{item.product.name} x {item.quantity}</span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Shipping Address</h3>
        <p>{shippingAddress.address}</p>
        <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
        <p>{shippingAddress.country}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <p>{paymentMethod}</p>
        <p className={`mt-1 ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
          {isPaid ? 'Paid' : 'Not Paid'}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Delivery Status</h3>
        <p className={isDelivered ? 'text-green-600' : 'text-red-600'}>
          {isDelivered ? 'Delivered' : 'Not Delivered'}
        </p>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total:</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
