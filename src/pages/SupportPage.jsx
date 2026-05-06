import React, { useState } from 'react';

const ChevronDown = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);
const TruckIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);
const FBIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const FAQS = [
  {
    q: 'What is the minimum order quantity?',
    a: 'Our minimum order starts at 6 pieces for Pro tier and 10 pieces for Starter tier. Elite orders have no minimum — perfect for sample orders or small squads.',
  },
  {
    q: 'How long does production take?',
    a: 'Standard production takes 7–14 business days after design approval. Rush orders (3–5 days) are available at an additional fee. We will confirm your estimated completion date upon order confirmation.',
  },
  {
    q: 'Can I provide my own design?',
    a: 'Absolutely! You can upload your own design file (AI, PSD, PDF, or high-res PNG). Our team will review it for print-readiness and let you know if any adjustments are needed.',
  },
  {
    q: 'What if I don\'t have a design?',
    a: 'No worries! Use our online Customizer to build your design from scratch, or choose one of our Design Templates as a starting point. Our graphic designer can also create a design for you.',
  },
  {
    q: 'What fabric do you use?',
    a: 'We use 100% polyester moisture-wicking fabric for all sublimation prints. Premium fabric upgrades (heavier GSM, anti-odor treatments) are available on Elite tier orders.',
  },
  {
    q: 'Will the colors fade or crack?',
    a: 'Never. Sublimation printing bonds the dye directly into the fabric fibers — it cannot crack, peel, or fade with normal washing. The design is literally part of the fabric.',
  },
  {
    q: 'Do you ship nationwide?',
    a: 'Yes! We ship to all provinces in the Philippines via J&T Express, LBC, or Lalamove (Metro Manila same-day available). Shipping cost is shouldered by the buyer unless stated otherwise.',
  },
  {
    q: 'Can I request a sample before bulk ordering?',
    a: 'Yes. Single-piece sample orders are available under the Elite tier. Contact us first so we can discuss your design and confirm the sample price before production.',
  },
];

const SHIPPING_INFO = [
  {
    carrier: 'J&T Express',
    coverage: 'Nationwide',
    eta: '2–5 business days',
    note: 'Standard for most orders',
  },
  {
    carrier: 'LBC',
    coverage: 'Nationwide',
    eta: '3–7 business days',
    note: 'Available on request',
  },
  {
    carrier: 'Lalamove',
    coverage: 'Metro Manila only',
    eta: 'Same day / Next day',
    note: 'For urgent Metro Manila orders',
  },
  {
    carrier: 'Personal Pick-up',
    coverage: 'By arrangement',
    eta: 'N/A',
    note: 'Contact us to arrange',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-gray-800 transition-colors ${open ? 'bg-[#0d0d0d]' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[0.82rem] font-bold text-white uppercase tracking-wide">{q}</span>
        <span className={`shrink-0 text-[#c9a84c] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-[0.78rem] text-gray-400 leading-relaxed border-t border-gray-800 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: 'faq', label: 'FAQ', icon: '?' },
  { id: 'contact', label: 'Contact', icon: '✉' },
  { id: 'shipping', label: 'Shipping', icon: '📦' },
];

export default function SupportPage() {
  const [tab, setTab] = useState('faq');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── HERO ── */}
      <section className="relative border-b border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#c9a84c]" />
        <div className="max-w-6xl mx-auto px-8 py-20">
          <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-4 block">Help Center</span>
          <h1 className="text-5xl font-black text-white uppercase leading-none mb-3">Support</h1>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Got questions? We've got answers. Reach out anytime — we're a small team and we respond fast.
          </p>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="border-b border-gray-800 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-8 flex gap-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-[0.72rem] font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
                tab === t.id
                  ? 'border-[#c9a84c] text-[#c9a84c]'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-8 py-14">

        {/* ── FAQ ── */}
        {tab === 'faq' && (
          <div>
            <p className="text-[0.72rem] text-gray-600 uppercase tracking-widest mb-8">
              {FAQS.length} frequently asked questions
            </p>
            <div className="border border-gray-800">
              {FAQS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
            </div>
            <div className="mt-8 text-[0.75rem] text-gray-500">
              Can't find your answer?{' '}
              <button onClick={() => setTab('contact')} className="text-[#c9a84c] underline hover:no-underline">
                Contact us directly
              </button>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {tab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-3 block">Get In Touch</span>
              <h2 className="text-2xl font-black text-white uppercase mb-4">We respond<br />within 24 hours.</h2>
              <p className="text-[0.78rem] text-gray-500 leading-relaxed mb-8">
                Whether you have a question, want to place an order, or need design help — just reach out. We're here.
              </p>
              <div className="space-y-4">
                <a href="mailto:cacheprints24@gmail.com"
                  className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200">
                  <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all shrink-0">
                    <MailIcon />
                  </div>
                  <div>
                    <div className="text-[0.6rem] text-gray-600 uppercase tracking-widest">Email</div>
                    <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">cacheprints24@gmail.com</div>
                  </div>
                </a>
                <a href="tel:+639524881584"
                  className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200">
                  <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all shrink-0">
                    <PhoneIcon />
                  </div>
                  <div>
                    <div className="text-[0.6rem] text-gray-600 uppercase tracking-widest">Phone / Viber</div>
                    <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">0952 488 1584</div>
                  </div>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61566923159356" target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200">
                  <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all shrink-0">
                    <FBIcon />
                  </div>
                  <div>
                    <div className="text-[0.6rem] text-gray-600 uppercase tracking-widest">Facebook</div>
                    <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">Cache Prints</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="border border-gray-800 p-8 bg-[#0d0d0d] self-start">
              <div className="text-[0.72rem] font-extrabold uppercase tracking-widest text-white mb-6">Send a Message</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[0.62rem] text-gray-500 uppercase tracking-widest mb-1.5">Your Name</label>
                  <input type="text" placeholder="Juan dela Cruz"
                    className="w-full bg-[#111] border border-gray-700 text-white text-[0.8rem] px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-gray-700" />
                </div>
                <div>
                  <label className="block text-[0.62rem] text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" placeholder="juan@email.com"
                    className="w-full bg-[#111] border border-gray-700 text-white text-[0.8rem] px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-gray-700" />
                </div>
                <div>
                  <label className="block text-[0.62rem] text-gray-500 uppercase tracking-widest mb-1.5">Message</label>
                  <textarea rows={4} placeholder="Tell us about your order or question..."
                    className="w-full bg-[#111] border border-gray-700 text-white text-[0.8rem] px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-gray-700 resize-none" />
                </div>
                <a
                  href="mailto:cacheprints24@gmail.com"
                  className="block text-center bg-[#c9a84c] text-[#0a0a0a] font-bold text-[0.72rem] uppercase tracking-widest py-3 hover:bg-white transition-colors"
                >
                  Send via Email
                </a>
                <p className="text-[0.62rem] text-gray-600 text-center">
                  Clicking above opens your email client pre-filled.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── SHIPPING ── */}
        {tab === 'shipping' && (
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-3 block">Delivery Options</span>
            <h2 className="text-2xl font-black text-white uppercase mb-8">Shipping Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {SHIPPING_INFO.map((s, i) => (
                <div key={i} className="border border-gray-800 p-6 bg-[#0d0d0d] hover:border-[#c9a84c] transition-colors group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-500 group-hover:text-[#c9a84c] transition-all shrink-0">
                      <TruckIcon />
                    </div>
                    <div>
                      <div className="text-[0.82rem] font-extrabold text-white uppercase">{s.carrier}</div>
                      <div className="text-[0.65rem] text-gray-500">{s.coverage}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <div>
                      <div className="text-[0.6rem] text-gray-600 uppercase tracking-widest">Est. Delivery</div>
                      <div className="text-[0.78rem] font-bold text-[#c9a84c]">{s.eta}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[0.68rem] text-gray-500">{s.note}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-gray-800 p-6 bg-[#0d0d0d] space-y-4">
              <div className="text-[0.72rem] font-extrabold uppercase tracking-widest text-white">Important Notes</div>
              <ul className="space-y-2.5 text-[0.75rem] text-gray-400">
                {[
                  'Shipping fees are shouldered by the buyer unless stated in a promo.',
                  'Orders are shipped only after full payment has been confirmed.',
                  'Production time (7–14 days) is separate from shipping transit time.',
                  'We are not liable for delays caused by the courier after handoff.',
                  'For bulk orders (50+ pcs), special freight arrangements can be made. Contact us.',
                  'Tracking numbers are provided via Facebook Messenger or Viber once your order ships.',
                ].map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#c9a84c] mt-0.5 shrink-0">·</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}