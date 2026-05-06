import React from 'react';

export default function ReceiptModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      let d;
      if (date && typeof date.toDate === 'function') {
        d = date.toDate();
      } else if (date && typeof date === 'object' && (date.seconds || date._seconds)) {
        const seconds = date.seconds || date._seconds;
        d = new Date(seconds * 1000);
      } else if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string') {
        d = new Date(date);
      } else if (typeof date === 'number') {
        d = new Date(date);
      } else {
        return 'N/A';
      }
      if (!d || isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const subtotal = order.items
    ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

      {/* Side Popup */}
      <div className="relative ml-auto bg-white w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-gray-800 text-white border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Receipt</h2>
            <p className="text-sm text-gray-200">Order #{order.id.substring(0, 12)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ PAYMENT CONFIRMED
            </span>
            <span className="text-sm text-gray-500">{formatDate(order.paymentReceiptDate || order.updatedAt)}</span>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Customer Information</h3>
            <div className="bg-light rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">NAME</span>
                <span className="font-medium">{order.customerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">EMAIL</span>
                <span className="font-medium">{order.customerEmail || 'N/A'}</span>
              </div>
              {order.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">PHONE</span>
                  <span className="font-medium">{order.phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">ORDER DATE</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {order.orderType && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Delivery Information</h3>
              <div className="bg-light rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">TYPE</span>
                  <span className="font-medium capitalize">
                    {order.orderType === 'pickup' ? 'Pick Up' : 'Shipping'}
                  </span>
                </div>
                {order.orderType === 'shipping' && order.shippingAddress && (
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-xs text-gray-600 mb-1">SHIPPING ADDRESS</p>
                    <p className="font-medium text-sm">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.stateProvince}{' '}
                      {order.shippingAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Items Ordered</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              {order.items && order.items.length > 0 ? (
                <>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between pb-3 border-b border-border last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="space-y-2 pt-3 border-t-2 border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    {order.setupFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Setup Fee:</span>
                        <span>₱{order.setupFee.toFixed(2)}</span>
                      </div>
                    )}
                    {order.shippingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping:</span>
                        <span>₱{order.shippingFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="font-semibold">Total Paid:</span>
                      <span className="text-xl font-bold text-primary">
                        ₱{order.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No items</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          {order.qrCodeLabel && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Payment Method</h3>
              <div className="bg-light rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">METHOD</span>
                  <span className="font-medium">{order.qrCodeLabel}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Receipt Image */}
          {order.paymentReceipt && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Payment Proof</h3>
              <div className="bg-light rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Submitted: {formatDate(order.paymentReceiptDate)}
                </p>
                <img
                  src={order.paymentReceipt}
                  alt="Payment Receipt"
                  className="max-w-sm max-h-64 rounded border border-border"
                />
                {order.paymentReceiptFileName && (
                  <p className="text-xs text-gray-500 mt-2">{order.paymentReceiptFileName}</p>
                )}
              </div>
            </div>
          )}

          {/* Thank You Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-semibold text-lg">Thank you for your order!</p>
            <p className="text-green-700 text-sm mt-1">
              Your payment has been confirmed. We'll begin production shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePrint}
              className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 transition"
            >
              🖨 Print Receipt
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-border rounded font-medium text-gray-700 hover:bg-light transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}