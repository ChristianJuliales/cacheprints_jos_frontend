import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

/* ── Status config ── */
const STATUS_CONFIG = {
  'Order Received':   { label: 'Order Received',   pill: 'bg-slate-50 text-slate-700 border border-slate-200',   step: 0 },
  'pending':          { label: 'Pending',          pill: 'bg-amber-50 text-amber-800 border border-amber-200',    step: 0 },
  'pending-payment':  { label: 'Pending Payment',  pill: 'bg-orange-50 text-orange-800 border border-orange-200', step: 1 },
  'paid':             { label: 'Paid',             pill: 'bg-blue-50 text-blue-800 border border-blue-200',       step: 2 },
  'Designing':        { label: 'Designing',        pill: 'bg-blue-50 text-blue-800 border border-blue-200',       step: 2 },
  'Printing':         { label: 'Printing',         pill: 'bg-violet-50 text-violet-800 border border-violet-200', step: 2 },
  'Heat Press':       { label: 'Heat Press',       pill: 'bg-pink-50 text-pink-800 border border-pink-200',       step: 2 },
  'Sewing':           { label: 'Sewing',           pill: 'bg-emerald-50 text-emerald-800 border border-emerald-200', step: 2 },
  'Quality Check':    { label: 'Quality Check',    pill: 'bg-amber-50 text-amber-800 border border-amber-200',     step: 2 },
  'Ready for Pickup': { label: 'Ready for Pickup', pill: 'bg-cyan-50 text-cyan-800 border border-cyan-200',       step: 3 },
  'for-shipping':     { label: 'For Shipping',     pill: 'bg-cyan-50 text-cyan-800 border border-cyan-200',       step: 3 },
  'completed':        { label: 'Completed',        pill: 'bg-green-50 text-green-800 border border-green-200',    step: 4 },
  'rejected':         { label: 'Rejected',         pill: 'bg-red-50 text-red-800 border border-red-200',          step: -1 },
};

const DEFAULT_STATUS = STATUS_CONFIG['Order Received'];

/* ── Track steps — dynamic based on orderType ── */
const getTrackSteps = (orderType) => [
  { key: 'placed',     label: 'Order placed',      desc: 'Order received by store' },
  { key: 'paid',       label: 'Payment', desc: 'Payment verified' },
  { key: 'production', label: 'In production',     desc: 'Manufacturing in progress' },
  {
    key: 'shipping',
    label: orderType === 'pickup' ? 'Ready for pickup' : 'For shipping',
    desc:  orderType === 'pickup' ? 'Ready at store'   : 'Dispatched to courier',
  },
  { key: 'completed',  label: 'Completed',         desc: 'Delivered / ready for pickup' },
];

/* ── Helpers ── */
const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotIcon = ({ color = '#fff' }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <circle cx="4" cy="4" r="3" fill={color} />
  </svg>
);

function StepDot({ state }) {
  const base = 'w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10';
  if (state === 'done')   return <div className={`${base} bg-[#111]`}><CheckIcon /></div>;
  if (state === 'active') return <div className={`${base} bg-amber-400`}><DotIcon /></div>;
  return <div className={`${base} bg-[#e8e5e0]`}><DotIcon color="#bbb" /></div>;
}

/* ── Horizontal mini-tracker on cards ── */
function MiniTracker({ currentStep, orderType }) {
  const steps = getTrackSteps(orderType);
  return (
    <div className="flex items-start gap-0 pt-3 border-t border-[#f0ede8]">
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'future';
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 relative">
            <div className="relative flex items-center w-full justify-center">
              <StepDot state={state} />
              {i < steps.length - 1 && (
                <div
                  className={`absolute left-[calc(50%+11px)] top-[10px] h-[2px] w-[calc(100%-22px)] ${
                    i < currentStep ? 'bg-[#111]' : 'bg-[#e8e5e0]'
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[0.6rem] mt-1.5 text-center leading-tight max-w-[52px] ${
                state === 'done' ? 'text-[#555]' : state === 'active' ? 'text-[#111] font-semibold' : 'text-[#bbb]'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Vertical tracker in sidebar ── */
function SidebarTracker({ currentStep, order }) {
  const orderType = order?.orderType;
  const steps = getTrackSteps(orderType);

  const formatDateShort = (date) => {
    if (!date) return null;
    try {
      let d;
      if (typeof date?.toDate === 'function') d = date.toDate();
      else if (date?.seconds || date?._seconds) d = new Date((date.seconds || date._seconds) * 1000);
      else d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return null; }
  };

  const stepDescs = [
    { done: `${formatDateShort(order?.createdAt) || 'Received'} — confirmed`, pending: 'Waiting for order' },
    { done: 'Payment verified',   pending: 'Awaiting payment' },
    { done: 'Production complete', pending: 'Manufacturing in progress' },
    {
      done:    orderType === 'pickup' ? 'Ready at store for pickup' : 'Dispatched to courier',
      pending: orderType === 'pickup' ? 'Preparing for pickup'     : 'Awaiting dispatch',
    },
    { done: 'Delivered / ready for pickup', pending: 'Awaiting completion' },
  ];

  return (
    <div className="mt-2">
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'future';
        const isLast = i === steps.length - 1;
        return (
          <div key={step.key} className="flex gap-3 relative" style={{ paddingBottom: isLast ? 0 : '12px' }}>
            {!isLast && (
              <div
                className={`absolute left-[10px] top-[22px] w-[1.5px] h-[calc(100%-10px)] ${
                  i < currentStep ? 'bg-[#111]' : 'bg-[#e8e5e0]'
                }`}
              />
            )}
            <StepDot state={state} />
            <div className="pt-0.5">
              <div className={`text-[0.82rem] font-semibold ${state === 'future' ? 'text-[#ccc]' : 'text-[#111]'}`}>
                {step.label}
              </div>
              <div className="text-[0.7rem] text-[#aaa] mt-0.5">
                {state === 'done' ? stepDescs[i].done : stepDescs[i].pending}
              </div>
              {step.key === 'production' && state === 'active' && order.productionPhase && (
                <div className="text-[0.62rem] text-violet-600 font-bold uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-violet-50 rounded-md inline-block border border-violet-100">
                   Phase: {order.productionPhase}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── formatDate ── */
function formatDate(date) {
  if (!date) return 'N/A';
  try {
    let d;
    if (typeof date?.toDate === 'function') d = date.toDate();
    else if (date?.seconds || date?._seconds) d = new Date((date.seconds || date._seconds) * 1000);
    else if (date instanceof Date) d = date;
    else d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return 'N/A'; }
}

/* ── Cancellation Reason Options ── */
const CANCEL_REASONS = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'wrong_size', label: 'Ordered wrong size' },
  { value: 'wrong_design', label: 'Wrong design / customization' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'too_long', label: 'Taking too long' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'duplicate', label: 'Duplicate order' },
  { value: 'other', label: 'Other reason' },
];

/* ── Cancel Modal ── */
function CancelModal({ order, onClose, onConfirm, loading }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selectedReason === 'other'
    ? customReason.trim()
    : CANCEL_REASONS.find(r => r.value === selectedReason)?.label || '';

  const canSubmit = finalReason.length > 0 && !loading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#f0ede8]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-['Syne',serif] text-[1.2rem] font-extrabold text-[#111]">
              Cancel Order
            </h2>
          </div>
          <p className="text-[0.8rem] text-gray-400 ml-11">
            This action cannot be undone. Please select a reason.
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Order ID */}
          <div className="bg-[#f8f7f4] px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
            <svg width="12" height="12" fill="none" stroke="#999" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-mono text-[0.72rem] text-gray-500">Order #{order?.id?.substring(0, 12)}</span>
          </div>

          {/* Reason selector */}
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-2.5">
            Reason for cancellation <span className="text-red-400">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {CANCEL_REASONS.map(reason => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={`text-left px-3 py-2 rounded-xl border text-[0.75rem] font-medium transition-all ${
                  selectedReason === reason.value
                    ? 'bg-[#111] text-white border-[#111]'
                    : 'bg-white text-[#555] border-[#e8e5e0] hover:border-[#bbb] hover:bg-[#f8f7f4]'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>

          {/* Custom reason (only when "Other" is selected) */}
          {selectedReason === 'other' && (
            <div className="mb-3">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value.slice(0, 300))}
                placeholder="Please describe your reason..."
                className="w-full p-3 border border-[#e8e5e0] rounded-xl text-[0.8rem] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] resize-none text-[#111] placeholder-gray-300"
                rows="3"
                autoFocus
              />
              <p className="text-[0.68rem] text-gray-300 text-right mt-0.5">{customReason.length}/300</p>
            </div>
          )}

          {/* Warning note */}
          {selectedReason && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
              <svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-[0.72rem] text-amber-700 leading-relaxed">
                Cancellations may not be accepted if your order is already in production. Our team will review and confirm.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 text-[0.82rem] font-bold text-[#111] bg-transparent border-[1.5px] border-[#ddd] rounded-xl hover:bg-[#f8f7f4] hover:border-[#bbb] transition-all disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={() => onConfirm(finalReason)}
              disabled={!canSubmit}
              className="flex-1 py-2.5 text-[0.82rem] font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Cancelling...
                </>
              ) : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/jos/my-orders');
      const mappedOrders = response.data.map(o => ({ ...o, id: o._id }));
      setOrders(mappedOrders);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getStep = (status) => STATUS_CONFIG[status]?.step ?? 0;

  const canViewReceipt = (status) =>
    ['Designing', 'Printing', 'Heat Press', 'Sewing', 'Quality Check', 'Ready for Pickup', 'for-shipping', 'completed'].includes(status);

  const canCancelOrder = (status) => {
    const nonCancellableStatuses = ['completed', 'rejected', 'for-shipping'];
    return !nonCancellableStatuses.includes(status);
  };

  const handleConfirmCancel = async (reason) => {
    if (!selectedOrder) return;
    setCancelLoading(true);
    try {
      await apiClient.put(`/jos/orders/${selectedOrder.id}/cancel`, {
        cancellationReason: reason,
      });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      setSelectedOrder(null);
      fetchUserOrders();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    if (order.status === 'pending-payment') {
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ede8] py-10">
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Syne',serif] text-[2rem] font-extrabold text-[#111] tracking-tight leading-none">
            My Orders
          </h1>
          <p className="text-[0.85rem] text-gray-400 mt-1.5">
            Track your custom apparel orders and communicate with our team
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="w-10 h-10 rounded-full border-2 border-[#e8e5e0] border-t-[#111] animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── Orders List ── */}
            <div className="space-y-4">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || DEFAULT_STATUS;
                const step = getStep(order.status);
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => handleCardClick(order)}
                    className={`bg-white rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                        : 'border border-[#e8e5e0] hover:border-[#bbb] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-['Syne',serif] text-[0.95rem] font-bold text-[#111] tracking-tight">
                          Order #{order.id.substring(0, 12)}
                        </h3>
                        <p className="text-[0.72rem] text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.orderType && (
                          <span className={`text-[0.62rem] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            order.orderType === 'pickup'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {order.orderType === 'pickup' ? ' Pickup' : ' Shipping'}
                          </span>
                        )}
                        <span className={`text-[0.68rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.pill}`}>
                          {order.status === 'for-shipping' && order.orderType === 'pickup' ? 'Ready for Pickup' : cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-[#f0ede8] mb-3.5">
                      <div>
                        <p className="text-[0.65rem] text-gray-400 uppercase tracking-wider mb-0.5">Total Price</p>
                        <p className="text-[0.95rem] font-bold text-[#111]">
                          ₱{(parseFloat(order.totalPrice) || parseFloat(order.totalAmount) || 0).toLocaleString('en-PH')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-gray-400 uppercase tracking-wider mb-0.5">Items</p>
                        <p className="text-[0.95rem] font-bold text-[#111]">{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>

                    {/* Color swatches */}
                    {order.customizationDetails && (
                      <div className="flex items-center gap-2 mb-3.5">
                        <div
                          className="w-[18px] h-[18px] rounded-[5px] border border-black/10"
                          style={{ backgroundColor: order.customizationDetails.primaryColor }}
                        />
                        <div
                          className="w-[18px] h-[18px] rounded-[5px] border border-black/10"
                          style={{ backgroundColor: order.customizationDetails.accentColor }}
                        />
                        {order.customizationDetails.customText && (
                          <span className="text-[0.72rem] text-gray-400">
                            Text: {order.customizationDetails.customText}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Mini progress tracker */}
                    <MiniTracker currentStep={step} orderType={order.orderType} />

                    {/* Bottom actions row */}
                    <div className="flex items-center justify-between mt-2.5">
                      {/* Cancel button — left side */}
                      {canCancelOrder(order.status) ? (
                        <button
                          onClick={(e) => openCancelModal(e, order)}
                          className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-red-500 hover:text-red-700 transition-colors group"
                        >
                          <svg
                            width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                            className="group-hover:scale-110 transition-transform"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel order
                        </button>
                      ) : (
                        <div /> /* spacer */
                      )}

                      {/* Receipt link — right side */}
                      {canViewReceipt(order.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowReceiptModal(true);
                          }}
                          className="text-[0.72rem] font-semibold text-[#111] border-b border-[#111] pb-px hover:opacity-50 transition-opacity"
                        >
                          View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Sidebar ── */}
            <div className="bg-white rounded-2xl border border-[#e8e5e0] p-6 sticky top-6">
              {selectedOrder ? (
                <>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1.5">
                    Order Status
                  </p>
                  <p className="font-['Syne',serif] text-[1.35rem] font-extrabold text-[#111] tracking-tight mb-5 pb-5 border-b border-[#f0ede8]">
                    {selectedOrder.status === 'for-shipping' && selectedOrder.orderType === 'pickup'
                      ? 'Ready for Pickup'
                      : (STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status)}
                  </p>

                  <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">Order ID</p>
                    <p className="font-mono text-[0.78rem] text-gray-500 bg-[#f8f7f4] px-2.5 py-1.5 rounded-lg break-all">
                      {selectedOrder.id}
                    </p>
                  </div>

                  {selectedOrder.orderType && (
                    <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1.5">
                        Delivery Method
                      </p>
                      <span className={`inline-flex items-center gap-1.5 text-[0.78rem] font-semibold px-3 py-1 rounded-full border ${
                        selectedOrder.orderType === 'pickup'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {selectedOrder.orderType === 'pickup' ? ' Store Pickup' : ' Shipping'}
                      </span>
                    </div>
                  )}

                  <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Progress</p>
                    <SidebarTracker currentStep={getStep(selectedOrder.status)} order={selectedOrder} />
                  </div>

                  {selectedOrder.customizationDetails && (
                    <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5">
                        Customization
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-[22px] h-[22px] rounded-md border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: selectedOrder.customizationDetails.primaryColor }}
                          />
                          <span className="text-[0.78rem] text-gray-500">
                            Primary: {selectedOrder.customizationDetails.primaryColor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-[22px] h-[22px] rounded-md border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: selectedOrder.customizationDetails.accentColor }}
                          />
                          <span className="text-[0.78rem] text-gray-500">
                            Accent: {selectedOrder.customizationDetails.accentColor}
                          </span>
                        </div>
                        {selectedOrder.customizationDetails.customText && (
                          <div className="text-[0.78rem] text-gray-500">
                            <span className="text-gray-400">Text: </span>
                            {selectedOrder.customizationDetails.customText}
                          </div>
                        )}
                        {selectedOrder.customizationDetails.logoImage && (
                          <div className="text-[0.78rem] text-gray-500">Logo: Included ✓</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Total</p>
                    <p className="font-['Syne',serif] text-[1.9rem] font-extrabold text-[#111] tracking-tight leading-none">
                      ₱{(parseFloat(selectedOrder.totalPrice) || parseFloat(selectedOrder.totalAmount) || 0).toLocaleString('en-PH')}
                    </p>
                  </div>

                  {canViewReceipt(selectedOrder.status) && (
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="w-full py-2.5 mb-2.5 text-[0.82rem] font-bold bg-[#111] text-white rounded-xl hover:bg-[#333] transition-colors"
                    >
                      View Receipt
                    </button>
                  )}
                  <button
                    onClick={() => openChat(selectedOrder.id, selectedOrder.status)}
                    className="w-full py-2.5 mb-2.5 text-[0.82rem] font-bold text-[#111] bg-transparent border-[1.5px] border-[#ddd] rounded-xl hover:bg-[#f8f7f4] hover:border-[#bbb] transition-all"
                  >
                    Open Chat with Admin
                  </button>
                  {canCancelOrder(selectedOrder.status) && (
                    <button
                      onClick={(e) => openCancelModal(e, selectedOrder)}
                      className="w-full py-2.5 text-[0.82rem] font-bold text-red-600 bg-transparent border-[1.5px] border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      Cancel Order
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-[#f0ede8] flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" fill="none" stroke="#bbb" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-[0.82rem] text-gray-300 leading-relaxed">
                    Select an order to view<br />details and chat
                  </p>
                </div>
              )}
            </div>
          </div>

        ) : (
          <div className="bg-white rounded-2xl border border-[#e8e5e0] p-16 text-center">
            <p className="text-gray-400 text-[0.9rem] mb-5">You haven't placed any orders yet</p>
            <a
              href="/store"
              className="inline-block px-6 py-2.5 bg-[#111] text-white text-[0.82rem] font-bold rounded-xl hover:bg-[#333] transition-colors"
            >
              Browse the store →
            </a>
          </div>
        )}

        <PaymentModal
          order={selectedOrder}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onReceiptSubmitted={() => { setShowPaymentModal(false); fetchUserOrders(); }}
        />
        <ReceiptModal
          order={selectedOrder}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />

        {/* Cancel Modal */}
        {showCancelModal && (
          <CancelModal
            order={selectedOrder}
            loading={cancelLoading}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleConfirmCancel}
          />
        )}
      </div>
    </div>
  );
}