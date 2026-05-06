import React from 'react';
import { Link } from 'react-router-dom';

// ── Icons ────────────────────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const PrintIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z" />
  </svg>
);
const ShirtIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const BuildingIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V9m6 12V9M9 12h6M9 15h6" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.354 1.844.573 2.81.65A2 2 0 0122 14.92z" />
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ icon, title, desc }) => (
  <div className="group border border-gray-800 p-6 hover:border-[#c9a84c] transition-all duration-300 hover:bg-[#0d0d0d]">
    <div className="w-11 h-11 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all duration-300 mb-4">
      {icon}
    </div>
    <div className="text-[0.78rem] font-extrabold uppercase tracking-widest text-white mb-2">{title}</div>
    <div className="text-[0.74rem] text-gray-500 leading-relaxed">{desc}</div>
  </div>
);

// ── Stat Block ───────────────────────────────────────────────────────────────
const StatBlock = ({ number, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-black text-[#c9a84c] uppercase">{number}</div>
    <div className="text-[0.65rem] text-gray-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[480px] bg-[#0a0a0a] flex items-center border-b border-gray-800">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        {/* Gold accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-[#c9a84c]" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-24 w-full">
          <span className="inline-block text-[#c9a84c] text-[0.7rem] font-bold tracking-[3px] uppercase mb-5">
            Est. 2024 · Sublimation Specialists
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase leading-none mb-4">
            About
          </h1>
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8"
            style={{ WebkitTextStroke: '2px #c9a84c', color: 'transparent' }}
          >
            Cache Prints
          </h1>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Your number one go-to custom sublimation sportswear &amp; apparel shop. We turn ideas into wearable identity.
          </p>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-[#111] border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatBlock number="21K+" label="Happy Followers" />
          <StatBlock number="2024" label="Year Founded" />
          <StatBlock number="100%" label="Custom Sublimation" />
          <StatBlock number="∞" label="Design Possibilities" />
        </div>
      </section>

      {/* ── OUR STORY ────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-4 block">Our Story</span>
            <h2 className="text-3xl font-black text-white uppercase leading-tight mb-6">
              Crafted with passion.<br />Built for champions.
            </h2>
            <div className="space-y-4 text-[0.82rem] text-gray-400 leading-relaxed">
              <p>
                Cache Prints was born from a simple belief: every athlete, every team, every organization deserves
                gear that looks as fierce as they perform. Founded in 2024, we set out to redefine what custom
                sublimation sportswear means in the Philippines.
              </p>
              <p>
                We combine precision graphic design with full custom sublimation printing—meaning your colors
                are embedded directly into the fabric. No cracking. No peeling. No fading. Just sharp, vibrant
                identity wear that lasts as long as your grind.
              </p>
              <p>
                From barangay basketball squads to corporate uniforms and government agencies, Cache Prints has
                dressed teams who refuse to blend in.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <span className="text-[0.7rem] text-gray-500 uppercase tracking-wide">Trusted by hundreds of teams</span>
            </div>
          </div>

          {/* Visual side — brand badge */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 border-2 border-[#c9a84c]/30 rounded-full animate-spin"
                style={{ animationDuration: '20s' }}
              />
              {/* Dashed ring */}
              <div className="absolute inset-4 border border-dashed border-gray-700 rounded-full" />
              {/* Center badge */}
              <div className="absolute inset-8 bg-[#111] border border-gray-700 rounded-full flex flex-col items-center justify-center">
                <div className="text-[0.55rem] font-bold uppercase tracking-[2px] text-[#c9a84c] mb-1">Cache</div>
                <div className="text-2xl font-black text-white uppercase">CP</div>
                <div className="text-[0.55rem] font-bold uppercase tracking-[2px] text-[#c9a84c] mt-1">Prints</div>
              </div>
              {/* Corner dots */}
              {[0, 90, 180, 270].map(deg => (
                <div
                  key={deg}
                  className="absolute w-2 h-2 bg-[#c9a84c] rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translateY(-128px) translateX(-50%)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-3 block">What We Offer</span>
          <h2 className="text-2xl font-black text-white uppercase mb-10">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServiceCard
              icon={<PrintIcon />}
              title="Full Custom Sublimation"
              desc="Dye-sublimation printing that bonds color directly into the fabric. Vivid. Permanent. Wash-proof."
            />
            <ServiceCard
              icon={<ShirtIcon />}
              title="Sportswear"
              desc="Basketball, volleyball, football, running kits — built for performance and built to impress on the court."
            />
            <ServiceCard
              icon={<UsersIcon />}
              title="Apparel"
              desc="T-shirts, hoodies, polos, and more — fully customizable for teams, events, and brand merchandise."
            />
            <ServiceCard
              icon={<BuildingIcon />}
              title="Company / Govt. Uniform"
              desc="Professional uniform solutions for corporations, government agencies, and institutions of any size."
            />
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-3 block">Get In Touch</span>
              <h2 className="text-2xl font-black text-white uppercase mb-4">Ready to outfit<br />your team?</h2>
              <p className="text-[0.82rem] text-gray-500 leading-relaxed mb-8">
                Reach out and let's talk about your custom apparel needs. No order too small, no design too bold.
              </p>
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-bold text-[0.72rem] tracking-widest uppercase px-6 py-3 hover:bg-white transition-colors duration-200"
              >
                Start Designing <ArrowRight />
              </Link>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <a
                href="mailto:cacheprints24@gmail.com"
                className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200"
              >
                <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all duration-200 shrink-0">
                  <MailIcon />
                </div>
                <div>
                  <div className="text-[0.62rem] text-gray-600 uppercase tracking-widest">Email</div>
                  <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">
                    cacheprints24@gmail.com
                  </div>
                </div>
              </a>
              {/* Phone */}
              <a
                href="tel:+639524881584"
                className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200"
              >
                <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all duration-200 shrink-0">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="text-[0.62rem] text-gray-600 uppercase tracking-widest">Phone / Viber</div>
                  <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">
                    0952 488 1584
                  </div>
                </div>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61566923159356"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-gray-800 p-5 hover:border-[#c9a84c] transition-all duration-200"
              >
                <div className="w-10 h-10 border border-gray-700 group-hover:border-[#c9a84c] flex items-center justify-center text-gray-400 group-hover:text-[#c9a84c] transition-all duration-200 shrink-0">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[0.62rem] text-gray-600 uppercase tracking-widest">Facebook</div>
                  <div className="text-[0.82rem] font-bold text-white group-hover:text-[#c9a84c] transition-colors">
                    Cache Prints
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}