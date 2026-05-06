import React, { useState } from 'react';
import ReceiptModal from './ReceiptModal';

export default function OrderCard({ order }) {
  const [showReceipt, setShowReceipt] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    'pending-payment': 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    'in-production': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-secondary">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-primary">Order #{order.id.substring(0, 8)}</h3>
            <p className="text-gray-600 text-sm">Created: {new Date(order.createdAt?.toDate?.()).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
            {order.status?.replace('-', ' ').toUpperCase()}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-gray-700 font-medium">Total: ₱{order.totalPrice}</p>
          <p className="text-gray-600 text-sm mt-2">Items: {order.items?.length || 0}</p>
        </div>

        {/* View Receipt button — only shown for paid/in-production/completed orders */}
        {['paid', 'in-production', 'completed'].includes(order.status) && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => setShowReceipt(true)}
              className="text-sm text-primary font-medium underline hover:text-gray-600 transition"
            >
              🧾 View Receipt
            </button>
          </div>
        )}
      </div>

      {/* Receipt Modal — renders outside the card div to avoid z-index issues */}
      <ReceiptModal
        order={order}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
}