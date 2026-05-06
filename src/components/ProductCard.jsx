import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product);
      toast.success('Added to order!');
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition group">
      {/* Product Image */}
      <div className="relative h-56 bg-light overflow-hidden">
        {product.imageBase64 ? (
          <img
            src={product.imageBase64}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-light">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-primary mb-1 line-clamp-1 text-sm">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        <p className="text-gray-600 text-xs mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Button */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="font-semibold text-primary text-sm">
            ₱{parseFloat(product.price).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-primary hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-medium transition"
          >
            {isAdding ? 'Adding...' : 'Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
