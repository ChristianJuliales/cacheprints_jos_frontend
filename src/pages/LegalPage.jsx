import React, { useState } from 'react';

const TABS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service' },
  { id: 'cookies', label: 'Cookies' },
];

const Section = ({ title, children }) => (
  <div className="mb-8">
    <div className="text-[0.72rem] font-extrabold uppercase tracking-widest text-[#c9a84c] mb-3">{title}</div>
    <div className="text-[0.78rem] text-gray-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function LegalPage() {
  const [tab, setTab] = useState('privacy');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── HERO ── */}
      <section className="relative border-b border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#c9a84c]" />
        <div className="max-w-6xl mx-auto px-8 py-20">
          <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-4 block">Legal</span>
          <h1 className="text-5xl font-black text-white uppercase leading-none mb-3">Policies &amp;<br />Terms</h1>
          <p className="text-gray-500 text-[0.75rem] mt-4">Last updated: January 2025 · Cache Prints / PrintSync</p>
        </div>
      </section>

      {/* ── TABS ── */}
      <section className="border-b border-gray-800 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-8 flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-[0.72rem] font-bold uppercase tracking-widest border-b-2 whitespace-nowrap transition-all duration-200 ${
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

      <div className="max-w-3xl mx-auto px-8 py-14">

        {/* ── PRIVACY ── */}
        {tab === 'privacy' && (
          <div>
            <p className="text-[0.78rem] text-gray-400 leading-relaxed mb-10">
              Cache Prints ("we", "us", "our") respects your privacy. This policy explains what personal information we collect, how we use it, and your rights regarding that information when you use our platform (PrintSync).
            </p>
            <Section title="1. Information We Collect">
              <p>When you create an account or place an order, we collect your name, email address, phone number, and delivery address.</p>
              <p>We may also collect design files you upload, order history, and communication records (e.g., messages sent via Facebook or email).</p>
            </Section>
            <Section title="2. How We Use Your Information">
              <p>· To process and fulfill your orders</p>
              <p>· To communicate order updates, shipping notifications, and support responses</p>
              <p>· To improve our platform and services</p>
              <p>· To send occasional promotional updates (you may opt out at any time)</p>
            </Section>
            <Section title="3. Data Sharing">
              <p>We do not sell your personal data. We may share information with courier partners (J&T, LBC, Lalamove) strictly for order delivery purposes.</p>
            </Section>
            <Section title="4. Data Security">
              <p>We use industry-standard measures to protect your data. However, no method of transmission over the internet is 100% secure. Use our platform at your own discretion.</p>
            </Section>
            <Section title="5. Your Rights">
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at cacheprints24@gmail.com.</p>
            </Section>
            <Section title="6. Contact">
              <p>For privacy concerns, email us at <a href="mailto:cacheprints24@gmail.com" className="text-[#c9a84c] hover:underline">cacheprints24@gmail.com</a>.</p>
            </Section>
          </div>
        )}

        {/* ── TERMS ── */}
        {tab === 'terms' && (
          <div>
            <p className="text-[0.78rem] text-gray-400 leading-relaxed mb-10">
              By using this platform, you agree to the following terms. Please read them carefully before placing any order.
            </p>
            <Section title="1. Orders & Payment">
              <p>All orders are confirmed only upon receipt of full payment. Prices are quoted in Philippine Peso (₱) and are subject to change without prior notice.</p>
              <p>We accept payments via GCash, bank transfer, or other methods communicated at the time of order. Cash on delivery is not available.</p>
            </Section>
            <Section title="2. Design Approval">
              <p>Production begins only after the customer has approved the final design proof. Cache Prints is not responsible for errors (spelling, colors, layout) approved by the customer.</p>
              <p>Design files submitted by the customer must not infringe on any third-party intellectual property rights.</p>
            </Section>
            <Section title="3. Production & Turnaround">
              <p>Standard turnaround is 7–14 business days after design approval. Rush orders are available at an additional cost. Delays caused by late design approvals or incomplete information are not our responsibility.</p>
            </Section>
            <Section title="4. Returns & Refunds">
              <p>Due to the custom nature of sublimation printing, we do not accept returns or issue refunds for completed orders unless the defect is caused by our production error (e.g., wrong size, print defect).</p>
              <p>Defective items must be reported within 3 days of receipt with photo evidence.</p>
            </Section>
            <Section title="5. Intellectual Property">
              <p>All original designs produced by our graphic designer remain the property of Cache Prints unless otherwise agreed in writing. Customers retain rights to their own uploaded artwork.</p>
            </Section>
            <Section title="6. Limitation of Liability">
              <p>Cache Prints is not liable for indirect, incidental, or consequential damages arising from delayed orders, courier mishandling, or force majeure events.</p>
            </Section>
            <Section title="7. Governing Law">
              <p>These terms are governed by the laws of the Republic of the Philippines.</p>
            </Section>
          </div>
        )}

        {/* ── COOKIES ── */}
        {tab === 'cookies' && (
          <div>
            <p className="text-[0.78rem] text-gray-400 leading-relaxed mb-10">
              This platform uses cookies and similar technologies to provide a better experience. Here's what that means.
            </p>
            <Section title="What Are Cookies?">
              <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and keep you logged in.</p>
            </Section>
            <Section title="What Cookies We Use">
              <p><span className="text-white font-bold">Authentication cookies</span> — Keep you logged into your account so you don't have to sign in every visit.</p>
              <p><span className="text-white font-bold">Session cookies</span> — Store temporary data like your cart and customizer state. These are deleted when you close your browser.</p>
              <p><span className="text-white font-bold">Preference cookies</span> — Remember settings like your selected product or design preferences.</p>
            </Section>
            <Section title="What We Don't Do">
              <p>We do not use third-party advertising cookies. We do not sell cookie data to anyone. We do not use cookies to track you across other websites.</p>
            </Section>
            <Section title="Your Choices">
              <p>You can disable cookies in your browser settings at any time. Note that disabling cookies may prevent you from logging in or using certain features of the platform.</p>
            </Section>
            <Section title="Questions?">
              <p>Email us at <a href="mailto:cacheprints24@gmail.com" className="text-[#c9a84c] hover:underline">cacheprints24@gmail.com</a> with any cookie-related questions.</p>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}