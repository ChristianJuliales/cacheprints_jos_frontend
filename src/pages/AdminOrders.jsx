import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../utils/apiClient';
import { useChatStore } from '../store/chatStore';
import OrderDetailsModal from '../components/OrderDetailsModal';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';

/* ─────────────────────────────────────────
   STATUS PIPELINE
───────────────────────────────────────── */
const STATUS_PIPELINE = [
  { key: 'Order Received',   label: 'Order Received',  short: 'Received',   color: '#64748b', bg: '#f1f5f9', text: '#334155', icon: '📥' },
  { key: 'pending-payment',  label: 'Pending Payment', short: 'Payment',    color: '#f97316', bg: '#fff7ed', text: '#9a3412', icon: '💳' },
  { key: 'Designing',        label: 'Designing',       short: 'Designing',  color: '#3b82f6', bg: '#eff6ff', text: '#1e40af', icon: '🎨' },
  { key: 'Printing',         label: 'Printing',        short: 'Printing',   color: '#8b5cf6', bg: '#f5f3ff', text: '#5b21b6', icon: '🖨️' },
  { key: 'Heat Press',       label: 'Heat Press',      short: 'Heat Press', color: '#ec4899', bg: '#fdf2f8', text: '#9d174d', icon: '🔥' },
  { key: 'Sewing',           label: 'Sewing',          short: 'Sewing',     color: '#10b981', bg: '#ecfdf5', text: '#065f46', icon: '🧵' },
  { key: 'Quality Check',    label: 'Quality Check',   short: 'Quality',    color: '#f59e0b', bg: '#fffbeb', text: '#92400e', icon: '🔍' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup',short: 'Ready',      color: '#06b6d4', bg: '#ecfeff', text: '#155e75', icon: '📦' },
  { key: 'completed',        label: 'Completed',       short: 'Done',       color: '#10b981', bg: '#ecfdf5', text: '#065f46', icon: '🎉' },
];

const REJECTED = { key: 'rejected', label: 'Rejected', short: 'Rejected', color: '#ef4444', bg: '#fef2f2', text: '#991b1b', icon: '✕' };

const STATUS_MAP = Object.fromEntries(
  [...STATUS_PIPELINE, REJECTED].map(s => [s.key, s])
);

const NEXT_STATUS = {
  'Order Received':  'pending-payment',
  'pending-payment': 'Designing',
  'Designing':       'Printing',
  'Printing':        'Heat Press',
  'Heat Press':      'Sewing',
  'Sewing':          'Quality Check',
  'Quality Check':   'Ready for Pickup',
  'Ready for Pickup':'completed',
  'completed':       null,
};

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChatIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
    <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PrintIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 10l-4-4m0 0L8 10m4-4v12"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);
const MessageSquareIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

/* ─────────────────────────────────────────
   PROOF OF PICKUP / DELIVERY PANEL
───────────────────────────────────────── */
function ProofOfDeliveryPanel({ order, onProofUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput]   = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [note, setNote]           = useState('');
  const fileInputRef              = useRef(null);

  const isPickup     = order.orderType === 'pickup';
  const isCompleted  = order.status === 'completed';
  const hasProof     = !!order.deliveryProof;

  const label = isPickup ? 'Pickup' : 'Delivery';

  // ── Upload file via FormData ──
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      if (note) formData.append('note', note);
      const res = await apiClient.post(`/jos/admin/orders/${order.id}/delivery-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const proofData = res.data?.deliveryProof || {
        url: URL.createObjectURL(file),
        note,
        uploadedAt: new Date().toISOString(),
        type: 'file',
      };
      toast.success(`${label} proof uploaded!`);
      onProofUploaded(order.id, proofData);
    } catch {
      toast.error('Failed to upload proof');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Save URL ──
  const handleSaveUrl = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    try {
      const res = await apiClient.post(`/jos/admin/orders/${order.id}/delivery-proof`, {
        url: urlInput.trim(),
        note,
      });
      const proofData = res.data?.deliveryProof || {
        url: urlInput.trim(),
        note,
        uploadedAt: new Date().toISOString(),
        type: 'url',
      };
      toast.success(`${label} proof saved!`);
      onProofUploaded(order.id, proofData);
      setUrlInput('');
      setShowUrlInput(false);
      setNote('');
    } catch {
      toast.error('Failed to save proof URL');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${hasProof ? 'border-emerald-200 bg-emerald-50' : isCompleted ? 'border-amber-200 bg-amber-50' : 'border-[#e5e7eb] bg-[#fafafa]'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-black/5">
        <PackageIcon />
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[#555]">
          Proof of {label}
        </span>
        {hasProof && (
          <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            ✓ Uploaded
          </span>
        )}
        {!hasProof && isCompleted && (
          <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            ⚠ Missing
          </span>
        )}
      </div>

      <div className="p-3 space-y-2.5">
        {/* Existing proof */}
        {hasProof && (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-emerald-200 bg-white">
              <img
                src={order.deliveryProof.url}
                alt={`${label} proof`}
                className="w-full max-h-48 object-contain"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
            {order.deliveryProof.note && (
              <p className="text-[0.72rem] text-emerald-800 italic bg-emerald-100 rounded-lg px-3 py-2">
                "{order.deliveryProof.note}"
              </p>
            )}
            <p className="text-[0.6rem] text-[#999]">
              Uploaded {order.deliveryProof.uploadedAt
                ? new Date(order.deliveryProof.uploadedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
                : 'recently'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[0.65rem] font-bold text-[#888] underline underline-offset-2 hover:text-[#555] transition-colors"
            >
              Replace photo
            </button>
          </div>
        )}

        {/* Upload controls */}
        {!hasProof && (
          <>
            {/* Note field */}
            <input
              type="text"
              placeholder={`Add a note (e.g. "Customer picked up at 2pm")`}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-[0.75rem] border border-[#e5e7eb] rounded-lg bg-white focus:outline-none focus:border-[#111] transition-colors placeholder-[#ccc]"
            />

            <div className="flex gap-2">
              {/* Upload photo */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#111] text-white text-[0.68rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <UploadIcon />}
                {uploading ? 'Uploading…' : 'Upload Photo'}
              </button>

              {/* Paste URL toggle */}
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3 py-2 border border-[#e5e7eb] bg-white text-[0.68rem] font-bold text-[#666] rounded-lg hover:bg-[#f5f5f5] transition-colors whitespace-nowrap"
              >
                Paste URL
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 animate-in">
                <input
                  type="url"
                  placeholder="https://…"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-[0.75rem] border border-[#e5e7eb] rounded-lg bg-white focus:outline-none focus:border-[#111] transition-colors placeholder-[#ccc]"
                />
                <button
                  onClick={handleSaveUrl}
                  disabled={uploading || !urlInput.trim()}
                  className="px-3 py-2 bg-[#111] text-white text-[0.68rem] font-bold rounded-lg hover:bg-[#333] disabled:opacity-40 transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CUSTOMER REVIEW PANEL
───────────────────────────────────────── */
function CustomerReviewPanel({ order }) {
  const review = order.customerReview;

  if (!review) {
    return (
      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-black/5">
          <MessageSquareIcon />
          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[#555]">
            Customer Review
          </span>
          <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-wider text-[#bbb] bg-[#f0f0f0] px-2 py-0.5 rounded-full">
            No review yet
          </span>
        </div>
        <div className="px-3 py-4 text-center">
          <p className="text-[0.72rem] text-[#ccc]">
            The customer hasn't left a review yet.
          </p>
        </div>
      </div>
    );
  }

  const rating     = review.rating || 0;
  const maxStars   = 5;
  const submittedAt = review.submittedAt
    ? new Date(review.submittedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const ratingColor = rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444';
  const ratingBg    = rating >= 4 ? '#ecfdf5' : rating >= 3 ? '#fffbeb' : '#fef2f2';
  const ratingText  = rating >= 4 ? '#065f46' : rating >= 3 ? '#92400e' : '#991b1b';

  return (
    <div className="rounded-xl border border-[#e5e7eb] overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#f0f0f0]">
        <MessageSquareIcon />
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[#555]">
          Customer Review
        </span>
        <span className="ml-auto text-[0.55rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: ratingBg, color: ratingText }}>
          {rating >= 4 ? '😊 Positive' : rating >= 3 ? '😐 Neutral' : '😞 Negative'}
        </span>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Stars + numeric */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }).map((_, i) => (
              <StarIcon key={i} filled={i < rating} />
            ))}
          </div>
          <span className="text-[0.8rem] font-black" style={{ color: ratingColor }}>
            {rating}<span className="text-[0.62rem] text-[#bbb] font-normal">/{maxStars}</span>
          </span>
        </div>

        {/* Review text */}
        {review.comment && (
          <div className="bg-[#fafafa] rounded-lg px-3 py-2.5 border-l-2 border-[#e5e7eb]">
            <p className="text-[0.78rem] text-[#444] leading-relaxed italic">
              "{review.comment}"
            </p>
          </div>
        )}

        {/* Tags / aspects */}
        {review.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map(tag => (
              <span key={tag} className="text-[0.6rem] font-bold uppercase tracking-wider bg-[#f0f0f0] text-[#666] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Photo(s) from customer */}
        {review.photos?.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {review.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Review photo ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-[#e5e7eb] hover:opacity-80 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        {/* Meta */}
        <p className="text-[0.6rem] text-[#bbb]">
          Submitted by <strong className="text-[#888]">{review.customerName || order.customerName}</strong>
          {submittedAt && <> · {submittedAt}</>}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDER SHEET MODAL
───────────────────────────────────────── */
function OrderSheetModal({ order, isOpen, onClose }) {
  const sheetRef = useRef(null);

  if (!isOpen || !order) return null;

  const getDeadline = () => {
    if (order.deadline) return order.deadline;
    try {
      let d;
      if (typeof order.createdAt?.toDate === 'function') d = order.createdAt.toDate();
      else if (order.createdAt?.seconds) d = new Date(order.createdAt.seconds * 1000);
      else d = new Date(order.createdAt);
      d.setDate(d.getDate() + 3);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch { return 'TBD'; }
  };

  const lineup = order?.customizationDetails?.lineup || [];

  const playerRows = lineup.length > 0
    ? lineup.map(player => ({
        name:   player.surname      || player.name    || '—',
        number: player.jerseyNumber ?? player.number  ?? '—',
        size:   player.size         || '—',
        addOn:  (typeof player.addOn === 'object' ? player.addOn?.name : player.addOn) || '—',
        note:   player.note         || player.ribbing || '',
      }))
    : (order.items?.map(item => ({
        name:   item.playerName   || item.productName || '—',
        number: item.jerseyNumber ?? item.number      ?? '—',
        size:   item.size         || item.variant     || '—',
        note:   item.note         || item.ribbing     || '',
      })) || []);

  const primaryColor   = order.customizationDetails?.primaryColor  || '#F5C518';
  const secondaryColor = order.customizationDetails?.accentColor
                      || order.customizationDetails?.secondaryColor
                      || '#2B8FD6';

  const teamName = order.teamName
                || order.design
                || order.customizationDetails?.customText
                || order.customerName
                || 'Team Name';

  const apparelType = order.customizationDetails?.apparelType
                   || order.items?.[0]?.productName
                   || '—';

  const fabricName = order.customizationDetails?.fabricName || null;
  const deadline   = getDeadline();
  const largeSizes = new Set(['XXL', '3XL', '4XL', '5XL', 'XXXL', 'XXXXL']);

  const handlePrint = () => {
    const content = sheetRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Order Sheet – ${teamName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Barlow', sans-serif; background: #fff; padding: 32px; max-width: 680px; margin: 0 auto; }
          @media print { body { padding: 0; } }
        </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '700px', maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
          background: '#fafafa', borderRadius: '16px 16px 0 0',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Order Sheet
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', background: '#111', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <PrintIcon /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: 'none',
                cursor: 'pointer', fontSize: '1rem', color: '#888',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={sheetRef} style={{ padding: '32px 36px', fontFamily: "'Barlow', sans-serif" }}>
          <div style={{ position: 'relative' }}>

            <div style={{
              position: 'absolute', left: '-28px', top: '60px',
              transform: 'rotate(-90deg)', transformOrigin: 'left center',
              fontSize: '11px', fontWeight: 600, color: '#888',
              whiteSpace: 'nowrap', letterSpacing: '0.04em',
            }}>
              DEADLINE: {deadline.toUpperCase()} (12PM)
            </div>

            <div style={{ textAlign: 'center', marginBottom: '6px', paddingLeft: '16px' }}>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '32px', fontWeight: 900, color: '#CC1111',
                letterSpacing: '2px', textTransform: 'uppercase', margin: 0,
              }}>
                {teamName}
              </h1>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '8px', flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '12px', fontWeight: 700, color: '#444',
                  letterSpacing: '1px', textTransform: 'uppercase',
                  background: '#f4f4f4', padding: '3px 10px',
                  border: '1px solid #ddd', borderRadius: '4px',
                }}>
                  {apparelType}
                </span>

                {fabricName && (
                  <>
                    <span style={{ color: '#ccc', fontSize: '14px' }}>·</span>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '12px', fontWeight: 700, color: '#1e40af',
                      letterSpacing: '1px', textTransform: 'uppercase',
                      background: '#eff6ff', padding: '3px 10px',
                      border: '1px solid #bfdbfe', borderRadius: '4px',
                    }}>
                      🧵 {fabricName}
                    </span>
                  </>
                )}
              </div>

              <p style={{ marginTop: '6px', fontSize: '11px', color: '#aaa' }}>
                {order.customerName && order.customerName !== teamName && (
                  <span>{order.customerName} · </span>
                )}
                <span style={{ fontFamily: 'monospace' }}>#{order.id?.substring(0, 10)}</span>
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingLeft: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f4f4f4' }}>
                    {['NAME', '#', 'SIZE', 'ADD-ON', 'NOTE'].map(h => (
                      <th key={h} style={{
                        border: '1px solid #ccc', padding: '7px 12px',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700, fontSize: '11px', letterSpacing: '1px',
                        textAlign: h === 'NAME' ? 'left' : 'center', color: '#333',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {playerRows.length > 0 ? playerRows.map((row, i) => {
                    if (!row) return null;
                    const isLarge = largeSizes.has(String(row.size || '').toUpperCase());
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ border: '1px solid #ddd', padding: '7px 12px', fontWeight: 600, color: '#222' }}>
                          {row.name}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '7px 12px', textAlign: 'center', color: '#444' }}>
                          {row.number}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '7px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: isLarge ? '#FF69B4' : 'transparent',
                            color: isLarge ? '#fff' : '#333',
                            fontWeight: isLarge ? 700 : 500,
                            padding: isLarge ? '2px 10px' : '0',
                            borderRadius: isLarge ? '4px' : '0',
                            fontSize: '12px',
                            fontFamily: "'Barlow Condensed', sans-serif",
                          }}>
                            {row.size}
                          </span>
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '7px 12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                          {String(row.addOn || '—')}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '7px 12px', textAlign: 'center', fontSize: '12px', color: '#555', textTransform: 'uppercase' }}>
                          {row.note}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} style={{ border: '1px solid #ddd', padding: '20px', textAlign: 'center', color: '#bbb', fontSize: '12px' }}>
                        No lineup provided — contact customer to confirm player details
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>
                  {playerRows.length} player{playerRows.length !== 1 ? 's' : ''} total
                </span>
                {playerRows.some(r => largeSizes.has(String(r.size).toUpperCase())) && (
                  <span style={{ fontSize: '11px', color: '#e91e9c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#FF69B4' }} />
                    Oversized sizes present
                  </span>
                )}
              </div>
            </div>

            {order.customizationDetails?.jerseyLayoutComments && (
              <div style={{ marginTop: '16px', paddingLeft: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Layout Notes:
                </span>
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#444', fontStyle: 'italic', borderLeft: '3px solid #eee', paddingLeft: '10px', margin: '4px 0 0 0' }}>
                  {order.customizationDetails?.jerseyLayoutComments}
                </p>
              </div>
            )}

            {order.finalDesignUrl && (
              <div style={{
                marginTop: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                paddingLeft: '16px'
              }}>
                <span style={{
                  fontSize: '10px', fontWeight: 800, color: '#222',
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  display: 'block', marginBottom: '10px', borderBottom: '2px solid #f0f0f0',
                  paddingBottom: '4px', textAlign: 'center', width: '100%', maxWidth: '400px'
                }}>
                  Final Approved Design Mockup
                </span>
                <div style={{
                  background: '#f9f9f9', border: '1px solid #ddd',
                  borderRadius: '10px', padding: '12px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  width: '100%', maxWidth: '600px'
                }}>
                  <img
                    src={order.finalDesignUrl}
                    alt="Final Design"
                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* ── Proof of delivery section in printed sheet ── */}
            {order.deliveryProof && (
              <div style={{ marginTop: '28px', paddingLeft: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#222', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Proof of {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}
                </span>
                <div style={{ marginTop: '8px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <img
                    src={order.deliveryProof.url}
                    alt="Delivery proof"
                    style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  <div>
                    {order.deliveryProof.note && (
                      <p style={{ fontSize: '11px', color: '#444', fontStyle: 'italic', margin: '0 0 4px 0' }}>
                        "{order.deliveryProof.note}"
                      </p>
                    )}
                    <p style={{ fontSize: '10px', color: '#aaa' }}>
                      {order.deliveryProof.uploadedAt
                        ? new Date(order.deliveryProof.uploadedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: '#fff',
                background: order.orderType === 'pickup' ? '#7c3aed' : '#0284c7',
                padding: '2px 10px', borderRadius: '20px',
              }}>
                {order.orderType === 'pickup' ? '🏬 Pickup' : '🚚 Shipping'}
              </span>
              {order.orderType === 'shipping' && order.shippingAddress && (
                <span style={{ fontSize: '11px', color: '#666' }}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName} — {order.shippingAddress.city}
                </span>
              )}
              <span style={{ fontSize: '11px', color: '#aaa', marginLeft: 'auto' }}>
                Total: <strong style={{ color: '#111' }}>₱{(parseFloat(order.totalPrice) || parseFloat(order.totalAmount) || 0).toLocaleString('en-PH')}</strong>
              </span>
            </div>

            <div style={{
              marginTop: '32px', paddingLeft: '16px',
              borderTop: '1px solid #e5e7eb', paddingTop: '20px',
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px',
            }}>
              {['Graphic Artist', 'Printer', 'Fabric Cutter', 'Heat Press', 'Sewer'].map(role => (
                <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '11px', fontWeight: 700, color: '#222',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{role}:</span>
                  <span style={{ fontSize: '11px', color: '#888', marginTop: '20px', borderTop: '0.5px solid #bbb', paddingTop: '3px' }}>
                    Checked by:
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CLICKABLE PROGRESS TRACKER
───────────────────────────────────────── */
function ProgressTracker({ order, onStatusUpdate, updatingStatus }) {
  const isPickup   = order.orderType === 'pickup';
  const isRejected = order.status === 'rejected';

  const steps = isPickup
    ? STATUS_PIPELINE.filter(s => s.key !== 'for-shipping')
    : STATUS_PIPELINE;

  const currentIdx = steps.findIndex(s => s.key === order.status);

  const getNextAllowed = () => {
    if (isRejected) return null;
    if (order.status === 'in-production') return isPickup ? 'completed' : 'for-shipping';
    return NEXT_STATUS[order.status] || null;
  };
  const nextAllowed = getNextAllowed();

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">✕</span>
        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Order Rejected</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, i) => {
          const isDone      = i < currentIdx;
          const isCurrent   = i === currentIdx;
          const isNext      = step.key === nextAllowed;
          const isFuture    = i > currentIdx && !isNext;
          const isClickable = isNext &&
                             !updatingStatus &&
                             !['Printing', 'Heat Press', 'Sewing', 'Quality Check'].includes(order.status) &&
                             (step.key !== 'completed' || order.finalPaymentReceipt);

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => isClickable && onStatusUpdate(order.id, step.key)}
                  disabled={!isClickable}
                  title={!isClickable && step.key === 'completed' ? 'Final payment proof required' : isClickable ? `Advance to "${step.label}"` : step.label}

                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 relative select-none',
                    isDone    ? 'bg-[#111] border-[#111] text-white' : '',
                    isCurrent ? 'border-[#111] bg-white text-[#111] shadow-[0_0_0_3px_rgba(17,17,17,0.1)]' : '',
                    isNext    ? 'border-dashed border-[#111] bg-white text-[#555] cursor-pointer hover:bg-[#111] hover:text-white hover:scale-110 hover:shadow-lg' : '',
                    isFuture  ? 'border-[#e5e7eb] bg-white text-[#ccc] cursor-default' : '',
                  ].join(' ')}
                >
                  {isDone ? <CheckIcon /> : <span className="text-[0.7rem]">{step.icon}</span>}
                  {isNext && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#111] pointer-events-none" />
                  )}
                </button>
                <span className={[
                  'text-[0.58rem] text-center leading-tight w-14 transition-colors',
                  isDone    ? 'text-[#888]'               : '',
                  isCurrent ? 'text-[#111] font-bold'     : '',
                  isNext    ? 'text-[#444] font-semibold' : '',
                  isFuture  ? 'text-[#ccc]'               : '',
                ].join(' ')}>
                  {step.short}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mb-5 mx-0.5 transition-colors duration-300 ${i < currentIdx ? 'bg-[#111]' : 'bg-[#e5e7eb]'}`} />
              )}
            </div>
          );
        })}
      </div>
      {nextAllowed && STATUS_MAP[nextAllowed] && (
        <p className="text-[0.62rem] text-[#999] mt-0.5 pl-0.5">
          ↑ Click <strong className="text-[#111]">{STATUS_MAP[nextAllowed].label}</strong> node to advance
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────── */
function OrderCard({ order, onStatusUpdate, updatingStatus, onOpenDetail, onOpenChat, onOpenSheet, onProofUploaded }) {
  const [expanded, setExpanded]   = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'proof' | 'review'
  const statusCfg = STATUS_MAP[order.status] || STATUS_MAP['Order Received'] || { color: '#ccc', bg: '#eee', text: '#888', icon: '❓', label: order.status };
  const isPickup  = order.orderType === 'pickup';

  const isCompleted = order.status === 'completed';
  const hasProof    = !!order.deliveryProof;
  const hasReview   = !!order.customerReview;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200
      ${expanded ? 'border-[#111] shadow-[0_8px_32px_rgba(0,0,0,0.1)]' : 'border-[#e5e7eb] hover:border-[#bbb] hover:shadow-md'}
    `}>
      <div className="h-[3px]" style={{ backgroundColor: statusCfg.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: statusCfg.bg }}>
              {statusCfg.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[0.82rem] font-bold text-[#111]">
                  #{order.id.substring(0, 10)}
                </span>
                <span className="text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider"
                  style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
                  {statusCfg.label}
                </span>
                <span className={`text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                  isPickup
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  {isPickup ? '🏬 Pickup' : '🚚 Ship'}
                </span>
                {/* Proof badge */}
                {isCompleted && (
                  <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wider ${
                    hasProof ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {hasProof ? '📸 Proof' : '📸 No Proof'}
                  </span>
                )}
                {/* Review badge */}
                {hasReview && (
                  <span className="text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wider bg-yellow-100 text-yellow-700">
                    ⭐ Review
                  </span>
                )}
              </div>
              <p className="text-[0.72rem] text-[#999] truncate">
                <span className="font-semibold text-[#555]">{order.customerName}</span>
                {order.createdAt && <span> · {formatDate(order.createdAt)}</span>}
                <span> · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right mr-1">
              <p className="text-[0.58rem] text-[#bbb] uppercase tracking-widest">Total</p>
              <p className="text-[1.05rem] font-black text-[#111] tracking-tight leading-tight">
                ₱{(parseFloat(order.totalPrice) || parseFloat(order.totalAmount) || 0).toLocaleString('en-PH')}
              </p>
            </div>
            <button onClick={() => onOpenDetail(order)}
              className="px-3 py-1.5 bg-[#111] text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#333] transition-colors">
              Details
            </button>
            <button onClick={() => onOpenSheet(order)}
              title="View printable order sheet"
              className="px-3 py-1.5 border border-[#ddd] text-[#555] text-[0.65rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#f5f5f5] transition-colors flex items-center gap-1">
              <PrintIcon /> Sheet
            </button>
            <button onClick={() => onOpenChat(order.id, order.status)}
              className="px-3 py-1.5 border border-[#ddd] text-[#555] text-[0.65rem] font-bold uppercase tracking-wider rounded-lg hover:bg-[#f5f5f5] transition-colors flex items-center gap-1">
              <ChatIcon /> Chat
            </button>
            <button onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors text-[#888]">
              <ChevronIcon open={expanded} />
            </button>
          </div>
        </div>

        <ProgressTracker order={order} onStatusUpdate={onStatusUpdate} updatingStatus={updatingStatus} />

        {expanded && (
          <div className="mt-4 pt-4 border-t border-[#f0f0f0] animate-in">

            {/* ── Tab bar ── */}
            <div className="flex gap-1 mb-4 bg-[#f5f5f5] p-1 rounded-xl">
              {[
                { key: 'details', label: 'Details' },
                { key: 'proof',   label: `${isPickup ? 'Pickup' : 'Delivery'} Proof`, dot: isCompleted && !hasProof },
                { key: 'review',  label: 'Customer Review', dot: hasReview },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.68rem] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-[#111] shadow-sm'
                      : 'text-[#999] hover:text-[#555]'
                  }`}
                >
                  {tab.label}
                  {tab.dot && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isCompleted && !hasProof && tab.key === 'proof' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* ── DETAILS TAB ── */}
            {activeTab === 'details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {order.customerEmail && (
                    <div className="bg-[#fafafa] rounded-xl p-3">
                      <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-[0.78rem] font-semibold text-[#333] truncate">{order.customerEmail}</p>
                    </div>
                  )}
                  {order.phoneNumber && (
                    <div className="bg-[#fafafa] rounded-xl p-3">
                      <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-[0.78rem] font-semibold text-[#333]">{order.phoneNumber}</p>
                    </div>
                  )}
                  <div className="bg-[#fafafa] rounded-xl p-3">
                    <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-0.5">Delivery</p>
                    <p className="text-[0.78rem] font-semibold text-[#333]">{isPickup ? 'Store Pickup' : 'Shipping'}</p>
                  </div>
                  <div className="bg-[#fafafa] rounded-xl p-3">
                    <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-0.5">Items</p>
                    <p className="text-[0.78rem] font-semibold text-[#333]">{order.items?.length || 0} item(s)</p>
                  </div>
                  {order.customizationDetails?.fabricName && (
                    <div className="bg-blue-50 rounded-xl p-3 col-span-2">
                      <p className="text-[0.58rem] text-blue-400 uppercase tracking-wider mb-0.5">Fabric Type</p>
                      <p className="text-[0.78rem] font-semibold text-blue-700">🧵 {typeof order.customizationDetails?.fabricName === 'object' ? 'Custom Fabric' : order.customizationDetails?.fabricName}</p>
                    </div>
                  )}
                </div>

                {order.items?.length > 0 && (
                  <div className="bg-[#fafafa] rounded-xl p-3">
                    <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-2">Items Ordered</p>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#eee] last:border-0">
                        <span className="text-[0.78rem] font-medium text-[#333]">{item.productName}</span>
                        <span className="text-[0.72rem] text-[#999]">×{item.quantity} · ₱{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order?.customizationDetails && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {order.customizationDetails.primaryColor && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md border border-black/10 shadow-sm"
                          style={{ backgroundColor: order.customizationDetails.primaryColor }} />
                        <span className="text-[0.65rem] text-[#999] font-mono">{order.customizationDetails.primaryColor}</span>
                      </div>
                    )}
                    {order.customizationDetails.accentColor && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md border border-black/10 shadow-sm"
                          style={{ backgroundColor: order.customizationDetails.accentColor }} />
                        <span className="text-[0.65rem] text-[#999] font-mono">{order.customizationDetails.accentColor}</span>
                      </div>
                    )}
                    {order.customizationDetails.customText && (
                      <span className="text-[0.72rem] text-[#666] italic">"{order.customizationDetails.customText}"</span>
                    )}
                  </div>
                )}

                {!isPickup && order.shippingAddress && (
                  <div className="bg-[#fafafa] rounded-xl p-3">
                    <p className="text-[0.58rem] text-[#bbb] uppercase tracking-wider mb-1">Ship to</p>
                    <p className="text-[0.78rem] text-[#444] leading-relaxed">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br/>
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                    </p>
                  </div>
                )}

                {(order.status === 'pending' || order.status === 'Order Received') && (
                  <button
                    onClick={() => onStatusUpdate(order.id, 'rejected')}
                    disabled={updatingStatus}
                    className="w-full py-2 text-[0.75rem] font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    ✕ Reject Order
                  </button>
                )}

                <button
                  onClick={() => onOpenSheet(order)}
                  className="w-full py-2 text-[0.75rem] font-bold text-[#555] border border-[#e5e7eb] rounded-xl hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-2"
                >
                  <PrintIcon /> View / Print Order Sheet
                </button>
              </div>
            )}

            {/* ── PROOF TAB ── */}
            {activeTab === 'proof' && (
              <ProofOfDeliveryPanel order={order} onProofUploaded={onProofUploaded} />
            )}

            {/* ── REVIEW TAB ── */}
            {activeTab === 'review' && (
              <CustomerReviewPanel order={order} />
            )}

          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ label, count, color, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: color + '18' }}>
        {icon}
      </div>
      <div>
        <p className="text-[1.5rem] font-black text-[#111] leading-none">{count}</p>
        <p className="text-[0.62rem] text-[#bbb] uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function AdminOrders() {
  const [orders, setOrders]                         = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [selectedOrder, setSelectedOrder]           = useState(null);
  const [showModal, setShowModal]                   = useState(false);
  const [showSheet, setShowSheet]                   = useState(false);
  const [sheetOrder, setSheetOrder]                 = useState(null);
  const [updatingStatus, setUpdatingStatus]         = useState(false);
  const [expandHistory, setExpandHistory]           = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [filterStatus, setFilterStatus]             = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await apiClient.get('/jos/admin/orders');
      setOrders(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error('Failed to load orders');
      setOrders([]);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    let finalStatus = newStatus;
    if (newStatus === 'next') {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      finalStatus = NEXT_STATUS[order.status];
      if (!finalStatus) return;
    }

    setUpdatingStatus(true);
    try {
      await apiClient.put(`/jos/admin/orders/${orderId}/status`, { status: finalStatus });
      toast.success(`Moved to "${STATUS_MAP[finalStatus]?.label || finalStatus}"`);
      const updated = orders.map(o => o.id === orderId ? { ...o, status: finalStatus } : o);
      setOrders(updated);
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: finalStatus });
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Proof uploaded callback ──
  const handleProofUploaded = (orderId, proofData) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, deliveryProof: proofData } : o);
    setOrders(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, deliveryProof: proofData });
  };

  const handleApprove         = (id) => handleStatusUpdate(id, 'pending-payment');
  const handleReject          = (id) => handleStatusUpdate(id, 'rejected');
  const handleApprovePayment  = (id) => handleStatusUpdate(id, 'Designing');
  const handleStartProduction = (id) => handleStatusUpdate(id, 'Printing');
  const handleMarkForShipping = (id) => handleStatusUpdate(id, 'Ready for Pickup');
  const handleComplete        = (id) => handleStatusUpdate(id, 'completed');

  const handleUploadFinalPayment = (orderId, finalPaymentReceipt) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, finalPaymentReceipt } : o);
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, finalPaymentReceipt });
    }
  };

  const handleOpenSheet = (order) => {
    setSheetOrder(order);
    setShowSheet(true);
  };

  const activeOrders    = (orders || []).filter(o => o && !['completed', 'rejected'].includes(o.status));
  const completedOrders = (orders || []).filter(o => o && o.status === 'completed');
  const rejectedOrders  = (orders || []).filter(o => o && o.status === 'rejected');

  // Stats: count completed orders missing proof
  const proofMissingCount = completedOrders.filter(o => !o.deliveryProof).length;
  const pendingReviewCount = (orders || []).filter(o => o.customerReview).length;

  const statuses = ['all', 'Order Received', 'pending-payment', 'Designing', 'Printing', 'Heat Press', 'Sewing', 'Quality Check', 'Ready for Pickup', 'completed', 'rejected'];

  const filteredActive = activeOrders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchSearch = order.id.toLowerCase().includes(q) || (order.customerName || '').toLowerCase().includes(q);
    const matchFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#f8f8f6] gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#e5e7eb] border-t-[#111] animate-spin" />
      <p className="text-[0.72rem] text-[#bbb] uppercase tracking-widest">Loading orders…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .animate-in { animation: fadeSlide 0.2s ease forwards; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }}
              className="text-[3.5rem] font-extrabold text-[#111] tracking-tight leading-none">
              Order Management
            </h1>
            <p className="text-[0.75rem] text-[#bbb] mt-1.5 tracking-wide">
              Click the dashed node on any order card to advance its status
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Alert banners */}
            {proofMissingCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <span className="text-amber-500 text-base">📸</span>
                <div>
                  <p className="text-[0.62rem] font-black text-amber-700 uppercase tracking-wider leading-none">{proofMissingCount} proof{proofMissingCount !== 1 ? 's' : ''} missing</p>
                  <p className="text-[0.55rem] text-amber-500 leading-none mt-0.5">Completed orders</p>
                </div>
              </div>
            )}
            {pendingReviewCount > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                <span className="text-yellow-500 text-base">⭐</span>
                <div>
                  <p className="text-[0.62rem] font-black text-yellow-700 uppercase tracking-wider leading-none">{pendingReviewCount} review{pendingReviewCount !== 1 ? 's' : ''}</p>
                  <p className="text-[0.55rem] text-yellow-500 leading-none mt-0.5">From customers</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.7rem] font-semibold text-[#666]">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Designing"     count={orders.filter(o => o.status === 'Designing').length}    color="#3b82f6" icon="🎨" />
          <StatCard label="Printing"      count={orders.filter(o => o.status === 'Printing').length}     color="#8b5cf6" icon="🖨️" />
          <StatCard label="Heat Press"    count={orders.filter(o => o.status === 'Heat Press').length}   color="#ec4899" icon="🔥" />
          <StatCard label="Sewing"        count={orders.filter(o => o.status === 'Sewing').length}       color="#10b981" icon="🧵" />
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc]"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search by order ID or customer name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[0.8rem] text-[#111] placeholder-[#ccc] focus:outline-none focus:border-[#111] transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[0.78rem] font-bold text-[#666] hover:border-[#111] transition-colors whitespace-nowrap"
            >
              <FilterIcon />
              {filterStatus === 'all' ? 'All Status' : STATUS_MAP[filterStatus]?.label || filterStatus}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#e5e7eb] rounded-xl z-20 w-52 shadow-xl overflow-hidden">
                {statuses.map(s => (
                  <button key={s}
                    onClick={() => { setFilterStatus(s); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[0.75rem] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2
                      ${filterStatus === s ? 'font-bold text-[#111] bg-[#f5f5f5]' : 'text-[#666]'}`}
                  >
                    {s !== 'all' && <span className="text-base">{STATUS_MAP[s]?.icon}</span>}
                    {s === 'all' ? 'All Statuses' : STATUS_MAP[s]?.label || s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredActive.length > 0 ? (
          <div className="space-y-4 mb-8">
            {filteredActive.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                updatingStatus={updatingStatus}
                onOpenDetail={(o) => { setSelectedOrder(o); setShowModal(true); }}
                onOpenChat={openChat}
                onOpenSheet={handleOpenSheet}
                onProofUploaded={handleProofUploaded}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-16 text-center mb-8">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-[0.85rem] text-[#bbb]">No active orders found</p>
          </div>
        )}

        {(completedOrders.length > 0 || rejectedOrders.length > 0) && (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandHistory(!expandHistory)}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-[#fafafa] transition-colors"
            >
              <div className="flex items-center gap-3">
                <h2 style={{ fontFamily: "'Syne', sans-serif" }}
                  className="text-[0.88rem] font-bold text-[#111] uppercase tracking-widest">
                  Order History
                </h2>
                <span className="text-[0.65rem] bg-[#f0f0f0] text-[#888] px-2 py-0.5 rounded-full font-bold">
                  {completedOrders.length + rejectedOrders.length}
                </span>
              </div>
              <ChevronIcon open={expandHistory} />
            </button>

            {expandHistory && (
              <div className="border-t border-[#f0f0f0] divide-y divide-[#f5f5f5]">
                {[...completedOrders, ...rejectedOrders].map(order => {
                  const cfg = STATUS_MAP[order.status];
                  const hasProof  = !!order.deliveryProof;
                  const hasReview = !!order.customerReview;
                  return (
                    <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cfg?.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[0.8rem] font-bold text-[#333]">#{order.id.substring(0, 10)}</p>
                            {order.status === 'completed' && (
                              <span className={`text-[0.5rem] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                                hasProof ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {hasProof ? '📸 Proof' : '📸 Missing'}
                              </span>
                            )}
                            {hasReview && (
                              <span className="text-[0.5rem] font-bold uppercase px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                ⭐ {order.customerReview.rating}/5
                              </span>
                            )}
                          </div>
                          <p className="text-[0.7rem] text-[#aaa]">
                            {order.customerName} · ₱{parseFloat(order.totalPrice).toLocaleString('en-PH')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: cfg?.bg, color: cfg?.text }}>
                          {cfg?.label}
                        </span>
                        <button
                          onClick={() => handleOpenSheet(order)}
                          className="text-[0.7rem] font-bold text-[#555] border border-[#e5e7eb] px-3 py-1 rounded-lg hover:bg-[#f5f5f5] transition-colors flex items-center gap-1"
                        >
                          <PrintIcon /> Sheet
                        </button>
                        <button
                          onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                          className="text-[0.7rem] font-bold text-[#555] border border-[#e5e7eb] px-3 py-1 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onApprovePayment={handleApprovePayment}
        onStartProduction={handleStartProduction}
        onMarkForShipping={handleMarkForShipping}
        onComplete={handleComplete}
        onUploadFinalPayment={handleUploadFinalPayment}
        onOpenChat={openChat}
        onUpdateStatus={handleStatusUpdate}
        updatingStatus={updatingStatus}
      />

      <OrderSheetModal
        order={sheetOrder}
        isOpen={showSheet}
        onClose={() => { setShowSheet(false); setSheetOrder(null); }}
      />
    </div>
  );
}