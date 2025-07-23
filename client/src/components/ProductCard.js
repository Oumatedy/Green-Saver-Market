import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { _id, name, description, price, imageUrl, category } = product;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/products/${_id}`}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/products/${_id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-bold">{formatPrice(price)}</span>
          <span className="text-sm text-gray-500">{category}</span>
        </div>
        <button
          className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
          onClick={() => {/* Add to cart functionality */}}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
