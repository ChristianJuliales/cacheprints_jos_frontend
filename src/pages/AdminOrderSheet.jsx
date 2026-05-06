import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────
   ICONS
 ───────────────────────────────────────── */
const PrintIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function AdminOrderSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const sheetRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/orders/public/orders/${id}/sheet`);
        setOrder(res.data);
      } catch (error) {
        toast.error('Failed to load order: ' + error.message);

      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#e5e7eb] border-t-[#111] animate-spin" />
      <p className="text-[0.72rem] text-[#bbb] uppercase tracking-widest">Generating Sheet…</p>
    </div>
  );

  if (!order) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <p className="text-xl font-bold text-gray-800">Order not found</p>
      <button onClick={() => navigate('/store')} className="mt-4 text-blue-600 underline">Go to Store</button>
    </div>
  );

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

  const lineup = order.customizationDetails?.lineup || [];
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
  const secondaryColor = order.customizationDetails?.accentColor || order.customizationDetails?.secondaryColor || '#2B8FD6';
  const teamName = order.customizationDetails?.customText || order.teamName || order.customerName || 'Team Name';
  const apparelType = order.customizationDetails?.apparelType || order.items?.[0]?.productName || '—';
  const fabricName = order.customizationDetails?.fabricName || null;
  const deadline = getDeadline();
  const largeSizes = new Set(['XXL', '3XL', '4XL', '5XL', 'XXXL', 'XXXXL']);

  const handlePrint = () => {
    const content = sheetRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Job Order Sheet – ${teamName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Barlow', sans-serif; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
          @media print { 
            body { padding: 0; margin: 0; width: 100%; } 
            .no-print { display: none !important; }
          }
        </style>
      </head><body>${content}</body></html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 1000);

  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[800px] mx-auto">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 no-print">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-semibold text-sm"
          >
            <BackIcon /> Back
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-lg"
          >
            <PrintIcon /> Print / Save PDF
          </button>
        </div>

        {/* Sheet Content */}
        <div 
          ref={sheetRef} 
          className="bg-white shadow-2xl rounded-2xl overflow-hidden p-12 relative border border-gray-100"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          <div className="relative">
            {/* Deadline watermark */}
            <div style={{
              position: 'absolute', left: '-40px', top: '80px',
              transform: 'rotate(-90deg)', transformOrigin: 'left center',
              fontSize: '12px', fontWeight: 700, color: '#d1d5db',
              whiteSpace: 'nowrap', letterSpacing: '0.1em',
            }}>
              DEADLINE: {deadline.toUpperCase()} (12PM)
            </div>

            {/* Header */}
            <div className="text-center mb-10 pl-4">
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '42px', fontWeight: 900, color: '#CC1111',
                letterSpacing: '2px', textTransform: 'uppercase', margin: 0,
                lineHeight: 1
              }}>
                {teamName}
              </h1>

              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <span className="font-['Barlow_Condensed'] text-[14px] font-bold text-gray-700 tracking-wider uppercase bg-gray-100 px-3 py-1 border border-gray-200 rounded-md">
                  {apparelType}
                </span>

                {fabricName && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="font-['Barlow_Condensed'] text-[14px] font-bold text-blue-800 tracking-wider uppercase bg-blue-50 px-3 py-1 border border-blue-200 rounded-md">
                      🧵 {fabricName}
                    </span>
                  </>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-400 font-medium tracking-wide">
                {order.customerName && order.customerName !== teamName && (
                  <span>{order.customerName} · </span>
                )}
                <span className="font-mono">#{order.id?.substring(0, 10)}</span>
              </p>
            </div>

            {/* Player table */}
            <div className="mt-8 pl-4">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-gray-50">
                    {['NAME', '#', 'SIZE', 'ADD-ON', 'NOTE'].map(h => (
                      <th key={h} className="border border-gray-300 p-2.5 font-['Barlow_Condensed'] font-bold text-[12px] tracking-wider text-center text-gray-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {playerRows.length > 0 ? playerRows.map((row, i) => {
                    const isLarge = largeSizes.has(String(row.size || '').toUpperCase());
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="border border-gray-200 p-2.5 font-semibold text-gray-900">{row.name}</td>
                        <td className="border border-gray-200 p-2.5 text-center text-gray-600 font-medium">{row.number}</td>
                        <td className="border border-gray-200 p-2.5 text-center">
                          <span className={`${isLarge ? 'bg-pink-500 text-white font-bold px-3 py-0.5 rounded' : 'text-gray-700 font-medium'} text-[13px] font-['Barlow_Condensed']`}>
                            {row.size}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-2.5 text-center text-[12px] font-bold text-blue-700 uppercase">{row.addOn || '—'}</td>
                        <td className="border border-gray-200 p-2.5 text-center text-[12px] text-gray-500 uppercase italic">{row.note}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="border border-gray-200 p-8 text-center text-gray-300 italic text-sm">No lineup details provided</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-3 flex items-center gap-5">
                <span className="text-[12px] text-gray-400 font-medium">
                  Total Items: {playerRows.length}
                </span>
                {playerRows.some(r => largeSizes.has(String(r.size).toUpperCase())) && (
                  <span className="text-[12px] text-pink-600 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    Oversized sizes included
                  </span>
                )}
              </div>
            </div>

            {/* Layout notes */}
            {order.customizationDetails?.jerseyLayoutComments && (
              <div className="mt-6 pl-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Production Notes:</span>
                <p className="text-[13px] text-gray-600 italic border-l-4 border-gray-100 pl-4 py-1 leading-relaxed bg-gray-50/30 rounded-r-lg">
                  {order.customizationDetails.jerseyLayoutComments}
                </p>
              </div>
            )}

            {/* Final Design Mockup */}
            {order.finalDesignUrl && (
              <div className="mt-12 flex flex-col items-center justify-center w-full pl-4">
                <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] block mb-6 border-b-2 border-gray-100 pb-2 text-center w-full max-w-[400px]">
                  APPROVED PRODUCTION DESIGN
                </span>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex justify-center items-center w-full shadow-inner">
                  <img 
                    src={order.finalDesignUrl} 
                    alt="Final Design" 
                    className="max-w-full max-h-[500px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            )}

            {/* Delivery Footer */}
            <div className="mt-12 pl-4 flex items-center gap-4">
              <span className={`text-[12px] font-bold text-white px-4 py-1 rounded-full ${order.orderType === 'pickup' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                {order.orderType === 'pickup' ? '🏬 Pickup' : '🚚 Shipping'}
              </span>
              {order.orderType === 'shipping' && order.shippingAddress && (
                <span className="text-[12px] text-gray-500 font-medium">
                  To: {order.shippingAddress.city}
                </span>
              )}
              <span className="text-[12px] text-gray-400 font-medium ml-auto">
                Value: <span className="text-black font-bold">₱{parseFloat(order.totalPrice || 0).toLocaleString('en-PH')}</span>
              </span>
            </div>

            {/* Sign-off */}
            <div className="mt-10 pl-4 border-t border-gray-100 pt-8 grid grid-cols-5 gap-6">
              {['Artist', 'Printer', 'Cutter', 'Presser', 'Sewer'].map(role => (
                <div key={role} className="flex flex-col gap-1">
                  <span className="font-['Barlow_Condensed'] text-[11px] font-bold text-black uppercase tracking-wider">{role}:</span>
                  <div className="mt-6 border-t border-gray-300 pt-1">
                    <span className="text-[9px] text-gray-400 uppercase font-bold">Sign-off</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
