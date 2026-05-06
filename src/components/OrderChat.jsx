import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function OrderChat({ orderId, orderStatus }) {
  const { user, userRole } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get(`/messages/${orderId}`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await apiClient.post('/messages', {
        orderId,
        message: newMessage,
        senderRole: userRole,
        senderName: user.displayName || user.email,
      });

      setNewMessage('');
      await fetchMessages();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border h-96 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-light">
        <h3 className="font-semibold text-primary">Conversation</h3>
        <p className="text-xs text-gray-600">Order Status: <span className="font-medium capitalize">{orderStatus}</span></p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.senderId === user.uid
                    ? 'bg-primary text-white'
                    : 'bg-light text-primary'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-white/70' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-light space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={sending}
            className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-600">
          {userRole === 'customer'
            ? 'Chat with admin about your order'
            : 'Contact customer about their order'}
        </p>
      </div>
    </div>
  );
}
