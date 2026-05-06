import React, { useState, useMemo } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onApprovePayment,
  onStartProduction,
  onComplete,
  onUploadFinalPayment,
  onOpenChat,
  updatingStatus,
}) {

  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [qrCodeLabel, setQrCodeLabel] = useState('');
  const [uploadingQR, setUploadingQR] = useState(false);
  const [approvePaymentLoading, setApprovePaymentLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [showDesignUpload, setShowDesignUpload] = useState(false);
  const [finalDesignFile, setFinalDesignFile] = useState(null);
  const [finalDesignPreview, setFinalDesignPreview] = useState(null);
  const [startingProduction, setStartingProduction] = useState(false);
  
  const [finalPaymentFile, setFinalPaymentFile] = useState(null);
  const [finalPaymentPreview, setFinalPaymentPreview] = useState(null);
  const [uploadingFinalPayment, setUploadingFinalPayment] = useState(false);


  const lineup = useMemo(() => order?.customizationDetails?.lineup || [], [order]);
  const oversizedSizes = ['XXL', '3XL', '4XL', '5XL'];

  const addonSummary = useMemo(() => {
    if (!lineup || lineup.length === 0) return null;
    const summary = {};
    lineup.forEach(p => {
      if (!p) return;
      if (p.addOn && (p.addOn.name || typeof p.addOn === 'string')) {
        const name = p.addOn.name || p.addOn;
        const price = p.addOn.price || 0;
        if (!summary[name]) {
          summary[name] = { count: 0, price: parseFloat(price), total: 0 };
        }
        summary[name].count += 1;
        summary[name].total += parseFloat(price);
      }
    });
    return Object.keys(summary).length > 0 ? summary : null;
  }, [lineup]);



  if (!isOpen || !order) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'pending-payment': 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    'in-production': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      let d;
      
      if (date && typeof date.toDate === 'function') {
        d = date.toDate();
      } 
      else if (date && typeof date === 'object' && (date.seconds || date._seconds)) {
        const seconds = date.seconds || date._seconds;
        d = new Date(seconds * 1000);
      }
      else if (date instanceof Date) {
        d = date;
      }
      else if (typeof date === 'string') {
        d = new Date(date);
      }
      else if (typeof date === 'number') {
        d = new Date(date);
      }
      else if (typeof date === 'object' && date !== null) {
        if (date.seconds !== undefined) {
          d = new Date(date.seconds * 1000);
        } else if (date._seconds !== undefined) {
          d = new Date(date._seconds * 1000);
        } else {
          return 'N/A';
        }
      }
      else {
        return 'N/A';
      }
      
      if (!d || isNaN(d.getTime())) {
        return 'N/A';
      }
      
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleQRCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }
      setQrCodeFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrCodePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQRCode = async () => {
    if (!qrCodeFile) {
      toast.error('Please select a QR code image');
      return;
    }

    if (!qrCodeLabel.trim()) {
      toast.error('Please enter a label for the QR code (e.g., GCash, Maya)');
      return;
    }

    setUploadingQR(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const qrBase64 = reader.result;
        
        await apiClient.put(`/admin/orders/${order.id}/upload-qr`, {
          qrCode: qrBase64,
          qrCodeLabel: qrCodeLabel,
        });

        toast.success('QR Code uploaded successfully!');
        setQrCodeFile(null);
        setQrCodePreview(null);
        setQrCodeLabel('');
      };
      reader.readAsDataURL(qrCodeFile);
    } catch (error) {
      toast.error('Failed to upload QR code: ' + error.message);
    } finally {
      setUploadingQR(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!order.paymentReceipt) {
      toast.error('No payment receipt uploaded by customer');
      return;
    }

    setApprovePaymentLoading(true);
    try {
      await apiClient.put(`/admin/orders/${order.id}/approve-payment`, {});
      toast.success('Payment approved! Order moved to production.');
      onApprovePayment(order.id);
    } catch (error) {
      toast.error('Failed to approve payment: ' + error.message);
    } finally {
      setApprovePaymentLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    setApprovePaymentLoading(true);
    try {
      await apiClient.put(`/admin/orders/${order.id}/reject-payment`, {});
      toast.success('Payment rejected. Customer will need to resubmit.');
      onReject(order.id);
    } catch (error) {
      toast.error('Failed to reject payment: ' + error.message);
    } finally {
      setApprovePaymentLoading(false);
    }
  };
  
  const handleDesignUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Design file must be less than 10MB');
        return;
      }
      setFinalDesignFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setFinalDesignPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmStartProduction = async () => {
    if (!finalDesignFile) {
      toast.error('Please attach the final design file');
      return;
    }

    setStartingProduction(true);
    try {
      // 1. Read file as Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(finalDesignFile);
      });

      // 2. Send to Backend
      const response = await apiClient.put(`/admin/orders/${order.id}/start-production`, {
        finalDesignUrl: base64
      });

      if (response.data) {
        toast.success('Production started! Synced to IMS.');
        onStartProduction(order.id);
        setShowDesignUpload(false);
        setFinalDesignFile(null);
        setFinalDesignPreview(null);
      }
    } catch (error) {
      console.error('Start production error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error occurred';
      toast.error('Failed to start production: ' + errorMsg);
    } finally {
      setStartingProduction(false);
    }
  };
  
  const handleFinalPaymentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }
      setFinalPaymentFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setFinalPaymentPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFinalPayment = async () => {
    if (!finalPaymentFile) {
      toast.error('Please attach the proof of payment');
      return;
    }

    setUploadingFinalPayment(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(finalPaymentFile);
      });

      await apiClient.put(`/admin/orders/${order.id}/upload-final-payment`, {
        finalPaymentReceipt: base64
      });

      toast.success('Proof of final payment uploaded!');
      
      if (onUploadFinalPayment) {
        onUploadFinalPayment(order.id, base64);
      } else {
        order.finalPaymentReceipt = base64; // Fallback
      }

      setFinalPaymentFile(null);
      setFinalPaymentPreview(null);
    } catch (error) {
      toast.error('Failed to upload proof: ' + error.message);
    } finally {
      setUploadingFinalPayment(false);
    }
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
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            <p className="text-sm text-gray-200 font-mono">{order.id}</p>
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
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status || 'pending']}`}>
              {(order.status || 'pending').replace('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Customer Information</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-600">CUSTOMER NAME</p>
                <p className="font-medium">{order.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">EMAIL</p>
                <p className="font-medium">{order.customerEmail || 'N/A'}</p>
              </div>
              {order.phoneNumber && (
                <div>
                  <p className="text-xs text-gray-600">PHONE NUMBER</p>
                  <p className="font-medium">{order.phoneNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">ORDER DATE</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.orderType && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Delivery Information</h3>
              <div className="bg-light rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-600">ORDER TYPE</p>
                  <p className="font-medium capitalize">{order.orderType === 'pickup' ? 'Pick Up' : 'Shipping'}</p>
                </div>
                {order.orderType === 'shipping' && order.shippingAddress && (
                  <>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-gray-600 mb-2">SHIPPING ADDRESS</p>
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      {order.shippingAddress.company && (
                        <p className="text-sm text-gray-600">{order.shippingAddress.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Items Ordered */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Items Ordered</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <p className="font-medium">{item.productName}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                      <div>Quantity: {item.quantity}</div>
                      <div>Price: ₱{item.price}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items</p>
              )}

              {addonSummary && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Individual Add-Ons</p>
                  <div className="space-y-1.5">
                    {Object.entries(addonSummary).map(([name, data]) => (
                      <div key={name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{name} (×{data.count})</span>
                        <span className="font-bold text-gray-800">₱{data.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Details */}
          {order.customizationDetails && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Customization Details</h3>
              <div className="bg-light rounded-lg p-4 space-y-3">
                {/* Primary Color */}
                {order.customizationDetails.primaryColor && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Primary Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-border shadow-sm"
                        style={{ backgroundColor: order.customizationDetails.primaryColor }}
                      ></div>
                      <span className="text-sm font-mono">{order.customizationDetails.primaryColor}</span>
                    </div>
                  </div>
                )}

                {/* Accent Color */}
                {order.customizationDetails.accentColor && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Accent Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-border shadow-sm"
                        style={{ backgroundColor: order.customizationDetails.accentColor }}
                      ></div>
                      <span className="text-sm font-mono">{order.customizationDetails.accentColor}</span>
                    </div>
                  </div>
                )}

                {/* Additional Colors */}
                {order.customizationDetails.additionalColors && (
                  <div>
                    <p className="text-gray-600 mb-2">Additional Colors:</p>
                    <div className="flex gap-2 ml-4">
                      {Object.values(order.customizationDetails.additionalColors).map((color, idx) => (
                        color && (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded border-2 border-border shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Text */}
                {order.customizationDetails.customText && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600">Custom Text:</p>
                    <p className="font-medium mt-1 italic">{order.customizationDetails.customText}</p>
                  </div>
                )}

                {/* Jersey Layout Comments */}
                {order.customizationDetails.jerseyLayoutComments && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600">Layout Notes:</p>
                    <p className="font-medium mt-1 bg-white p-2 rounded border border-border">
                      {order.customizationDetails.jerseyLayoutComments}
                    </p>
                  </div>
                )}

                {/* Logo */}
                {order.customizationDetails.logoImage && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600 mb-2">Logo Image:</p>
                    <img
                      src={order.customizationDetails.logoImage}
                      alt="Logo"
                      className="max-w-xs max-h-48 rounded border border-border cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImage({ url: order.customizationDetails.logoImage, title: 'Customer Logo' })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TEAM LINEUP ── */}
          {lineup.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Team Lineup
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({lineup.length} player{lineup.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="rounded-lg overflow-hidden border border-border">
                {/* Table Header */}
                <div
                  className="grid bg-gray-800 text-white px-4 py-2.5"
                  style={{ gridTemplateColumns: '36px 1fr 64px 64px 100px' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest">#</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Surname</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">No.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">Size</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">Add-On</p>
                </div>

                {/* Table Rows */}
                <div
                  className="max-h-64 overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {lineup.map((player, idx) => {
                    if (!player) return null;
                    const isOversized = oversizedSizes.includes(
                      (player.size || '').toUpperCase()
                    );
                    return (
                      <div
                        key={idx}
                        className={`grid px-4 py-2.5 border-b border-border last:border-b-0 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        style={{ gridTemplateColumns: '36px 1fr 64px 64px 100px' }}
                      >
                        <span className="text-xs font-black text-gray-400 self-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-800 uppercase self-center">
                          {player.surname || '—'}
                        </span>
                        <span className="text-sm font-black text-gray-800 text-center self-center">
                          {player.jerseyNumber || '—'}
                        </span>
                        <span className="text-center self-center">
                          {isOversized ? (
                            <span className="inline-block px-2 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full">
                              {player.size}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-600">
                              {player.size || '—'}
                            </span>
                          )}
                        </span>
                        <span className="text-center self-center text-[10px] font-bold text-blue-600 uppercase">
                          {typeof player.addOn === 'object' ? player.addOn?.name : player.addOn || '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer summary */}
                <div className="bg-gray-50 border-t border-border px-4 py-2 flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {lineup.length} player{lineup.length !== 1 ? 's' : ''} total
                  </span>
                  {lineup.some(p => p && oversizedSizes.includes((p.size || '').toUpperCase())) && (
                    <span className="flex items-center gap-1 text-[10px] text-pink-600 font-medium">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      Oversized sizes present
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No lineup provided notice */}
          {lineup.length === 0 && order.customizationDetails && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Team Lineup</h3>
              <div className="bg-light rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400 italic">No lineup provided by customer.</p>
                <p className="text-xs text-gray-400 mt-1">Contact the customer to confirm player details.</p>
              </div>
            </div>
          )}

          {/* Order Total */}
          <div className="border-t border-b border-border py-3">
            <p className="text-gray-600">Order Total</p>
            <p className="text-3xl font-bold text-primary">₱{order.totalPrice}</p>
          </div>

          {/* Payment Management Section */}
          {order.status === 'pending-payment' && (
            <div className="border-t border-b border-orange-300 bg-orange-50 p-4 space-y-4">
              {/* QR Code Upload Section */}
              {!order.qrCode && (
                <div className="bg-white p-3 rounded border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2">📱 Upload QR Code for Payment</h4>
                  <div className="bg-orange-100 p-2 rounded border border-orange-200 mb-3 text-center">
                    <p className="text-xs text-orange-800 uppercase font-bold tracking-wider">Downpayment Required (20%)</p>
                    <p className="text-lg font-black text-orange-600">₱{(parseFloat(order.totalPrice || 0) * 0.20).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Upload a QR code image so customer can scan and pay</p>
                  
                  {qrCodePreview && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img src={qrCodePreview} alt="QR Code Preview" className="max-w-xs max-h-32 rounded border border-border" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={qrCodeLabel}
                      onChange={(e) => setQrCodeLabel(e.target.value)}
                      placeholder="E-Wallet to Use (e.g., GCash, Maya)"
                      className="w-full px-3 py-2 border border-border rounded text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      className="w-full text-sm"
                    />
                    <button
                      onClick={handleUploadQRCode}
                      disabled={!qrCodeFile || !qrCodeLabel || uploadingQR}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code Uploaded Indicator */}
              {order.qrCode && (
                <div className="bg-green-50 p-3 rounded border border-green-300">
                  <p className="text-sm text-green-800 font-medium">✓ QR Code uploaded</p>
                  <p className="text-xs text-gray-600 mt-1">{order.qrCodeLabel || 'Payment Method'}</p>
                </div>
              )}

              {/* Payment Receipt Review Section */}
              {order.paymentReceipt && (
                <div className="bg-white p-3 rounded border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2">💳 Customer Payment Receipt</h4>
                  <img 
                    src={order.paymentReceipt} 
                    alt="Payment Receipt" 
                    className="max-w-xs max-h-40 rounded border border-border mb-3 cursor-zoom-in hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage({ url: order.paymentReceipt, title: 'Payment Receipt' })}
                  />
                  <p className="text-xs text-gray-600 mb-3">Uploaded: {formatDate(order.paymentReceiptDate)}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleApprovePayment}
                      disabled={approvePaymentLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {approvePaymentLoading ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={approvePaymentLoading}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {approvePaymentLoading ? '...' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting for Payment Receipt */}
              {!order.paymentReceipt && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800 font-medium">⏳ Waiting for customer to upload payment receipt</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {order.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onApprove(order.id)}
                  disabled={updatingStatus}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => onReject(order.id)}
                  disabled={updatingStatus}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
                >
                  ✕ Reject
                </button>
              </div>
            )}

            {order.status === 'pending-payment' && (
              <div>
                {order.paymentReceipt && order.status === 'pending-payment' && (
                  <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 mb-2 text-center">
                    Review payment receipt above
                  </div>
                )}
                {!order.paymentReceipt && (
                  <button
                    disabled={true}
                    className="w-full bg-gray-300 text-gray-600 py-2 rounded font-medium transition cursor-not-allowed"
                  >
                    ⏳ Waiting for Payment Receipt
                  </button>
                )}
              </div>
            )}

            {order.status === 'paid' && !showDesignUpload && (
              <button
                onClick={() => setShowDesignUpload(true)}
                disabled={updatingStatus}
                className="w-full bg-primary hover:bg-gray-800 disabled:opacity-50 text-white py-2 rounded font-medium transition"
              >
                → Start Production
              </button>
            )}

            {showDesignUpload && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                <h4 className="font-bold text-blue-900">🎨 Final Design Required</h4>
                <p className="text-xs text-blue-700">Attach the final layout or mockup to proceed. This will be synced to the IMS Production board.</p>
                
                {finalDesignPreview && (
                  <div className="relative w-full h-40 bg-white rounded border border-blue-200 overflow-hidden">
                    <img src={finalDesignPreview} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      onClick={() => { setFinalDesignFile(null); setFinalDesignPreview(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleDesignUploadChange}
                  className="w-full text-xs text-blue-900"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowDesignUpload(false)}
                    className="bg-white border border-blue-300 text-blue-700 py-2 rounded text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStartProduction}
                    disabled={startingProduction || !finalDesignFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50"
                  >
                    {startingProduction ? 'Uploading...' : 'Confirm & Start'}
                  </button>
                </div>
              </div>
            )}

            {(order.status === 'in-production' || order.status === 'for-shipping') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-orange-900">💰 Remaining Balance Payment</h4>
                    <p className="text-xs text-orange-700">Attach proof of payment for the remaining 80% balance.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.6rem] text-orange-400 uppercase font-bold tracking-widest">Balance Due</p>
                    <p className="text-lg font-black text-orange-600">₱{(parseFloat(order.totalPrice || 0) * 0.80).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>

                
                {order.finalPaymentReceipt ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">✓ Final Payment Attached</p>
                    <img 
                      src={order.finalPaymentReceipt} 
                      alt="Final Payment Proof" 
                      className="max-w-xs max-h-40 rounded border border-orange-200 cursor-zoom-in hover:opacity-90"
                      onClick={() => setPreviewImage({ url: order.finalPaymentReceipt, title: 'Final Payment Proof' })}
                    />
                  </div>
                ) : (
                  <>
                    {finalPaymentPreview && (
                      <div className="relative w-full h-40 bg-white rounded border border-orange-200 overflow-hidden">
                        <img src={finalPaymentPreview} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => { setFinalPaymentFile(null); setFinalPaymentPreview(null); }}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFinalPaymentChange}
                      className="w-full text-xs text-orange-900"
                    />

                    <button
                      onClick={handleUploadFinalPayment}
                      disabled={uploadingFinalPayment || !finalPaymentFile}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {uploadingFinalPayment ? 'Uploading...' : 'Upload Proof of Payment'}
                    </button>
                  </>
                )}
              </div>
            )}

            {(order.status === 'in-production' || order.status === 'for-shipping') && (
              <button
                onClick={() => onComplete(order.id)}
                disabled={updatingStatus || !order.finalPaymentReceipt}
                className={`w-full py-2 rounded font-medium transition ${
                  order.finalPaymentReceipt 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {order.finalPaymentReceipt ? '✓ Mark Complete' : '🔒 Payment Proof Required to Complete'}
              </button>
            )}


            <button
              onClick={() => onOpenChat(order.id, order.status)}
              className="w-full bg-secondary hover:bg-orange-400 text-white py-2 rounded font-medium transition"
            >
              Open Chat
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-90 animate-in fade-in duration-200">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setPreviewImage(null)}></div>
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{previewImage.title}</h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-bold transition"
              >
                ×
              </button>
            </div>
            <div className="p-2 overflow-auto bg-gray-100 flex justify-center items-start">
              <img 
                src={previewImage.url} 
                alt="Preview" 
                className="max-w-full h-auto shadow-lg"
                style={{ maxHeight: '80vh' }}
              />
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setPreviewImage(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}