import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ArrowRight = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    tag: 'For small teams',
    priceFrom: 350,
    priceTo: 450,
    unit: 'per piece',
    minOrder: '10 pcs minimum',
    color: '#2a2a2a',
    accent: '#aaaaaa',
    highlight: false,
    features: [
      { label: 'Full sublimation printing', ok: true },
      { label: 'Up to 2 design colors', ok: true },
      { label: 'Standard polyester fabric', ok: true },
      { label: 'Basic name & number', ok: true },
      { label: 'Custom logo placement', ok: false },
      { label: 'Rush production (3 days)', ok: false },
      { label: 'Premium fabric upgrade', ok: false },
      { label: 'Dedicated designer', ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: 'Most Popular',
    priceFrom: 500,
    priceTo: 650,
    unit: 'per piece',
    minOrder: '6 pcs minimum',
    color: '#c9a84c',
    accent: '#c9a84c',
    highlight: true,
    features: [
      { label: 'Full sublimation printing', ok: true },
      { label: 'Unlimited design colors', ok: true },
      { label: 'Premium moisture-wicking fabric', ok: true },
      { label: 'Custom name & number', ok: true },
      { label: 'Custom logo placement', ok: true },
      { label: 'Rush production (3 days)', ok: true },
      { label: 'Premium fabric upgrade', ok: false },
      { label: 'Dedicated designer', ok: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tag: 'Full custom',
    priceFrom: 700,
    priceTo: 950,
    unit: 'per piece',
    minOrder: '5 pcs minimum',
    color: '#2a2a2a',
    accent: '#ffffff',
    highlight: false,
    features: [
      { label: 'Full sublimation printing', ok: true },
      { label: 'Unlimited design colors', ok: true },
      { label: 'Premium moisture-wicking fabric', ok: true },
      { label: 'Custom name & number', ok: true },
      { label: 'Custom logo placement', ok: true },
      { label: 'Rush production (3 days)', ok: true },
      { label: 'Premium fabric upgrade', ok: true },
      { label: 'Dedicated designer', ok: true },
    ],
  },
];

const ADD_ONS = [
  { name: 'Shorts / Bottoms', price: '₱180 – ₱280', desc: 'Matching sublimated shorts or training pants' },
  { name: 'Jacket / Warmup', price: '₱350 – ₱500', desc: 'Full-zip or pullover warmup jacket' },
  { name: 'Socks (pair)', price: '₱80 – ₱120', desc: 'Custom sublimated ankle or crew socks' },
  { name: 'Cap / Headwear', price: '₱150 – ₱220', desc: 'Embroidered or sublimated team cap' },
  { name: 'Bag / Backpack', price: '₱400 – ₱650', desc: 'Custom printed drawstring or team backpack' },
  { name: 'Name & Number Only', price: '₱30 / player', desc: 'Add-on to existing garment design' },
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState('jerseys');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── HERO ── */}
      <section className="relative border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#c9a84c]" />
        <div className="max-w-6xl mx-auto px-8 py-20">
          <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-4 block">Transparent Pricing</span>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase leading-none mb-3">
            No hidden fees.
          </h1>
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-6"
            style={{ WebkitTextStroke: '2px #c9a84c', color: 'transparent' }}>
            Just great gear.
          </h1>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            All prices are in Philippine Peso (₱). Final price depends on quantity, fabric, and design complexity. Message us for a custom quote.
          </p>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="border-b border-gray-800 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-0">
            {[{ id: 'jerseys', label: 'Jerseys & Uniforms' }, { id: 'addons', label: 'Add-Ons & Extras' }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-[0.72rem] font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-[#c9a84c] text-[#c9a84c]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── JERSEYS TAB ── */}
      {activeTab === 'jerseys' && (
        <section className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative border flex flex-col ${
                  tier.highlight
                    ? 'border-[#c9a84c] bg-[#111]'
                    : 'border-gray-800 bg-[#0d0d0d] hover:border-gray-600'
                } transition-all duration-200`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#c9a84c] text-[#0a0a0a] text-[0.6rem] font-black uppercase tracking-widest px-3 py-1">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-6 border-b ${tier.highlight ? 'border-[#c9a84c]/30' : 'border-gray-800'}`}>
                  <div className="text-[0.62rem] font-bold uppercase tracking-[3px] mb-2"
                    style={{ color: tier.accent }}>
                    {tier.tag}
                  </div>
                  <div className="text-xl font-black text-white uppercase mb-4">{tier.name}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black" style={{ color: tier.accent }}>
                      ₱{tier.priceFrom}
                    </span>
                    <span className="text-gray-500 text-sm mb-1">– ₱{tier.priceTo}</span>
                  </div>
                  <div className="text-[0.65rem] text-gray-500 uppercase tracking-wide">{tier.unit}</div>
                  <div className="mt-3 text-[0.68rem] font-bold uppercase tracking-wide px-2 py-1 border inline-block"
                    style={{ borderColor: tier.accent + '44', color: tier.accent }}>
                    {tier.minOrder}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className={`flex items-center gap-3 text-[0.75rem] ${f.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`shrink-0 ${f.ok ? '' : 'opacity-30'}`} style={{ color: f.ok ? tier.accent : '#555' }}>
                          {f.ok ? <CheckIcon /> : <XIcon />}
                        </span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/customize"
                    className={`mt-8 flex items-center justify-center gap-2 py-3 text-[0.72rem] font-bold uppercase tracking-widest transition-colors duration-200 ${
                      tier.highlight
                        ? 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-white'
                        : 'border border-gray-700 text-white hover:border-white'
                    }`}
                  >
                    Start Designing <ArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk note */}
          <div className="mt-10 border border-gray-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0d0d0d]">
            <div>
              <div className="text-[0.72rem] font-extrabold uppercase tracking-widest text-white mb-1">Need 50+ pieces?</div>
              <div className="text-[0.75rem] text-gray-500">Bulk orders get special rates. Message us for a custom quote tailored to your team or organization.</div>
            </div>
            <a
              href="mailto:cacheprints24@gmail.com"
              className="shrink-0 inline-flex items-center gap-2 border border-[#c9a84c] text-[#c9a84c] text-[0.68rem] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors"
            >
              Get a Quote <ArrowRight />
            </a>
          </div>
        </section>
      )}

      {/* ── ADD-ONS TAB ── */}
      {activeTab === 'addons' && (
        <section className="max-w-6xl mx-auto px-8 py-16">
          <p className="text-[0.75rem] text-gray-500 mb-10 max-w-lg leading-relaxed">
            Add matching gear to complete your team's look. All add-ons use the same full-sublimation process for consistent color across every piece.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADD_ONS.map((item, i) => (
              <div key={i} className="group border border-gray-800 p-6 hover:border-[#c9a84c] transition-all duration-200 bg-[#0d0d0d]">
                <div className="text-[0.78rem] font-extrabold text-white uppercase tracking-wide mb-1">{item.name}</div>
                <div className="text-[0.72rem] text-gray-500 mb-4 leading-relaxed">{item.desc}</div>
                <div className="text-lg font-black text-[#c9a84c]">{item.price}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-[0.72rem] text-gray-600 border-t border-gray-800 pt-6">
            * All prices are estimates. Final pricing confirmed upon order review. Discounts apply for combined orders.
          </div>
        </section>
      )}

    </div>
  );
}