import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

/* ── Status config ── */
const STATUS_CONFIG = {
  pending:           { label: 'Pending',          pill: 'bg-amber-50 text-amber-800 border border-amber-200',    step: 0 },
  'pending-payment': { label: 'Pending Payment',  pill: 'bg-orange-50 text-orange-800 border border-orange-200', step: 1 },
  paid:              { label: 'Paid',             pill: 'bg-blue-50 text-blue-800 border border-blue-200',       step: 1 },
  'in-production':   { label: 'In Production',    pill: 'bg-violet-50 text-violet-800 border border-violet-200', step: 2 },
  'for-shipping':    { label: 'For Shipping',     pill: 'bg-cyan-50 text-cyan-800 border border-cyan-200',       step: 3 },
  completed:         { label: 'Completed',        pill: 'bg-green-50 text-green-800 border border-green-200',    step: 4 },
  rejected:          { label: 'Rejected',         pill: 'bg-red-50 text-red-800 border border-red-200',          step: -1 },
};

/* ── Track steps — dynamic based on orderType ── */
const getTrackSteps = (orderType) => [
  { key: 'placed',     label: 'Order placed',      desc: 'Order received by store' },
  { key: 'paid',       label: 'Payment confirmed', desc: 'Payment verified' },
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

/* ── Main Page ── */
export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/jos/my-orders');
      // Map _id to id for frontend compatibility
      const mappedOrders = response.data.map(o => ({ ...o, id: o._id }));
      setOrders(mappedOrders);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getStep = (status) => STATUS_CONFIG[status]?.step ?? 0;
  const canViewReceipt = (status) => ['paid', 'in-production', 'for-shipping', 'completed'].includes(status);

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
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
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
                        {/* Delivery type badge */}
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
                          ₱{parseFloat(order.totalPrice).toLocaleString('en-PH')}
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

                    {/* Mini progress tracker — pickup/shipping aware */}
                    <MiniTracker currentStep={step} orderType={order.orderType} />

                    {/* Receipt link */}
                    {canViewReceipt(order.status) && (
                      <div className="flex justify-end mt-2.5">
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Sidebar ── */}
            <div className="bg-white rounded-2xl border border-[#e8e5e0] p-6 sticky top-6">
              {selectedOrder ? (
                <>
                  {/* Status */}
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1.5">
                    Order Status
                  </p>
                  <p className="font-['Syne',serif] text-[1.35rem] font-extrabold text-[#111] tracking-tight mb-5 pb-5 border-b border-[#f0ede8]">
                    {selectedOrder.status === 'for-shipping' && selectedOrder.orderType === 'pickup'
                      ? 'Ready for Pickup'
                      : (STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status)}
                  </p>

                  {/* Order ID */}
                  <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2">Order ID</p>
                    <p className="font-mono text-[0.78rem] text-gray-500 bg-[#f8f7f4] px-2.5 py-1.5 rounded-lg break-all">
                      {selectedOrder.id}
                    </p>
                  </div>

                  {/* Delivery type */}
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

                  {/* Vertical progress — pickup/shipping aware */}
                  <div className="mb-4 pb-4 border-b border-[#f0ede8]">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Progress</p>
                    <SidebarTracker currentStep={getStep(selectedOrder.status)} order={selectedOrder} />
                  </div>

                  {/* Customization */}
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

                  {/* Total */}
                  <div className="mb-5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-1">Total</p>
                    <p className="font-['Syne',serif] text-[1.9rem] font-extrabold text-[#111] tracking-tight leading-none">
                      ₱{parseFloat(selectedOrder.totalPrice).toLocaleString('en-PH')}
                    </p>
                  </div>

                  {/* Actions */}
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
                    className="w-full py-2.5 text-[0.82rem] font-bold text-[#111] bg-transparent border-[1.5px] border-[#ddd] rounded-xl hover:bg-[#f8f7f4] hover:border-[#bbb] transition-all"
                  >
                    Open Chat with Admin
                  </button>
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
      </div>
    </div>
  );
}