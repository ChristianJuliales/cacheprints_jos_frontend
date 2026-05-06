import React, { useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

// ✅ Compress image to stay under Firestore's 1MB document limit
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');

        // Resize to max 800px wide while keeping aspect ratio
        const MAX_WIDTH = 800;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress as JPEG at 70% quality — keeps it well under 500KB
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PaymentModal({
  order,
  isOpen,
  onClose,
  onReceiptSubmitted,
  uploadingReceipt,
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setReceiptPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      toast.error('Please select a receipt file');
      return;
    }

    setIsSubmitting(true);
    try {
      // Compress the image before sending
      const compressed = await compressImage(receiptFile);

      // Safety check — warn if still too large (over ~700KB base64)
      if (compressed.length > 700000) {
        toast.error('Image is still too large after compression. Please use a smaller photo.');
        setIsSubmitting(false);
        return;
      }

      await apiClient.put(`/jos/orders/${order.id}/payment-receipt`, {
        paymentReceipt: compressed,
        fileName: receiptFile.name,
      });

      toast.success('Payment receipt submitted! Admin will verify it shortly.');
      setReceiptFile(null);
      setReceiptPreview(null);
      if (onReceiptSubmitted) onReceiptSubmitted();
    } catch (error) {
      toast.error('Failed to upload receipt: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />

      {/* Side Popup */}
      <div className="relative ml-auto bg-white w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-gray-800 text-white border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment</h2>
            <p className="text-sm text-gray-200">Order #{order.id.substring(0, 12)}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">×</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              {order.items && order.items.length > 0 && (
                <>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between pb-3 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="space-y-2 pt-3 border-t-2 border-border">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total:</span>
                      <span>₱{order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded p-3 mt-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">Downpayment (20%)</span>
                        <span className="text-[10px] text-amber-700">Required to begin layout production</span>
                      </div>
                      <span className="text-xl font-black text-amber-900">
                        ₱{(order.totalPrice * 0.20).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 px-1 pt-1">
                      <span>Remaining Balance</span>
                      <span>₱{(order.totalPrice * 0.80).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* QR Code */}
          {order.qrCode && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Payment Methods</h3>
              <div className="bg-light rounded-lg p-6 flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{order.qrCodeLabel || 'Scan to Pay'}</p>
                  <img src={order.qrCode} alt="Payment QR Code" className="w-64 h-64 border-2 border-border rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Upload Payment Receipt</h3>
            <div className="bg-light rounded-lg p-6 space-y-4">
              {order.paymentReceipt ? (
                <div>
                  <div className="flex items-center justify-between mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-green-800">Receipt Submitted</p>
                      <p className="text-xs text-green-700">{order.paymentReceiptFileName || 'Awaiting approval'}</p>
                    </div>
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Uploaded Receipt:</p>
                    <img src={order.paymentReceipt} alt="Payment Receipt" className="max-w-sm max-h-48 rounded border border-border" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-white">
                    <p className="text-sm text-gray-600 mb-1">Upload a photo or screenshot of your payment receipt</p>
                    <p className="text-xs text-gray-400 mb-3">Image will be automatically compressed</p>
                    <input
                      type="file"
                      onChange={handleReceiptUpload}
                      accept="image/*"
                      className="hidden"
                      id="receiptInput"
                    />
                    <label htmlFor="receiptInput" className="cursor-pointer">
                      <div className="text-3xl mb-2">📄</div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('receiptInput').click()}
                        className="px-4 py-2 border border-border rounded text-sm font-medium text-primary hover:bg-light transition"
                      >
                        Choose File
                      </button>
                    </label>
                  </div>

                  {receiptFile && (
                    <>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">✓ File selected: {receiptFile.name}</p>
                      </div>
                      {receiptPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img src={receiptPreview} alt="Receipt Preview" className="max-w-sm max-h-48 rounded border border-border" />
                        </div>
                      )}
                      <button
                        onClick={handleSubmitReceipt}
                        disabled={isSubmitting || uploadingReceipt}
                        className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        {isSubmitting || uploadingReceipt ? 'Compressing & Submitting...' : '✓ Submit Receipt'}
                      </button>
                      <button
                        onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                        className="w-full px-4 py-2 border border-border rounded font-medium text-gray-700 hover:bg-light transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Instructions:</span> Scan the QR code using your mobile banking app (GCash, Maya, PayMaya, etc.), complete the payment, then upload a screenshot or photo of the receipt as proof.
            </p>
          </div>

          <button onClick={onClose} className="w-full px-4 py-2 border border-border rounded font-medium text-gray-700 hover:bg-light transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}