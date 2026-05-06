import React from 'react';
import { useChatStore } from '../store/chatStore';
import OrderChat from './OrderChat';

export default function FloatingChatWindow() {
  const { isOpen, isMinimized, selectedOrderId, selectedOrderStatus, toggleMinimize, closeChat } = useChatStore();

  if (!isOpen || !selectedOrderId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-lg border border-border shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center bg-primary text-white p-4 rounded-t-lg">
        <h3 className="font-semibold text-sm">
          💬 Order Chat
        </h3>
        <div className="flex gap-2">
          <button
            onClick={toggleMinimize}
            className="hover:bg-gray-700 p-1 rounded transition"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={closeChat}
            className="hover:bg-red-600 p-1 rounded transition"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-96 overflow-hidden rounded-b-lg">
          <OrderChat orderId={selectedOrderId} orderStatus={selectedOrderStatus} />
        </div>
      )}
    </div>
  );
}
