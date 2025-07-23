import React from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { formatPrice } from '../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);

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

  if (!product) {
    return (
      <div className="text-center py-8">
        Product not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Category</h2>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
              {product.category}
            </span>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Stock Status</h2>
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold
              ${product.stock > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div>
            <button
              className={`w-full py-3 px-6 rounded-md font-semibold text-white
                ${product.stock > 0
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={product.stock === 0}
              onClick={() => {/* Add to cart functionality */}}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
