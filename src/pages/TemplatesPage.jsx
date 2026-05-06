import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowRight = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const ThumbIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const ALL_TEMPLATES = [
  { id: 1, name: 'TEAM-CORP-05',   category: 'Athletic Sports', sport: 'Basketball', likes: 1294, image: 'jerseyyellow.png' },
  { id: 2, name: 'ATHLETIC-PRO',   category: 'Sports',          sport: 'Basketball', likes: 814,  image: 'revel.png' },
  { id: 3, name: 'MINIMAL-EVENT',  category: 'Events',          sport: 'Volleyball', likes: 393,  image: 'stem.png' },
  { id: 4, name: 'INDUSTRIAL-X',   category: 'Activewear',      sport: 'General',    likes: 62,   image: 'polo.png' },
  // Add more here when you have more images
];

const CATEGORIES = ['All', ...Array.from(new Set(ALL_TEMPLATES.map(t => t.category)))];

const JerseyPlaceholder = ({ name = '' }) => (
  <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M60 20 L20 50 L10 90 L40 95 L40 200 L160 200 L160 95 L190 90 L180 50 L140 20 C130 35 70 35 60 20Z"
      fill="#1a1a1a" stroke="#333" strokeWidth="2" />
    <text x="100" y="125" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="36" fontWeight="bold" fontFamily="serif">5</text>
    <text x="100" y="155" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="9" fontFamily="monospace">{name}</text>
  </svg>
);

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = activeCategory === 'All'
    ? ALL_TEMPLATES
    : ALL_TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── HERO ── */}
      <section className="relative border-b border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute left-0 top-0 h-full w-1 bg-[#c9a84c]" />
        <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[#c9a84c] mb-4 block">Design Templates</span>
            <h1 className="text-5xl font-black text-white uppercase leading-none mb-3">Start with a<br />base design.</h1>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Pick a template and customize it your way — change colors, add your logo, name and number. Everything is editable.
            </p>
          </div>
          <button
            onClick={() => navigate('/customize')}
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0a0a0a] font-bold text-[0.72rem] tracking-widest uppercase px-6 py-3 hover:bg-white transition-colors shrink-0 self-start md:self-auto"
          >
            Start from Scratch <ArrowRight />
          </button>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="border-b border-gray-800 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-8 flex gap-0 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-4 text-[0.72rem] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all duration-200 ${
                activeCategory === cat
                  ? 'border-[#c9a84c] text-[#c9a84c]'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-2 text-[0.6rem] text-gray-700">
                  ({ALL_TEMPLATES.filter(t => t.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="max-w-6xl mx-auto px-8 py-14">
        <p className="text-[0.65rem] text-gray-600 uppercase tracking-widest mb-8">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-600 text-sm">No templates in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((tpl) => (
              <div
                key={tpl.id}
                className="group border border-gray-800 hover:border-[#c9a84c] transition-all duration-200 cursor-pointer bg-[#0d0d0d]"
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate('/customize')}
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center">
                  {tpl.image ? (
                    <img
                      src={`/images/${tpl.image}`}
                      alt={tpl.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-2/3 p-4">
                      <JerseyPlaceholder name={tpl.name} />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-[#c9a84c]/10 flex items-center justify-center transition-opacity duration-200 ${hoveredId === tpl.id ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-[#c9a84c] text-[#0a0a0a] text-[0.65rem] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2">
                      Customize This <ArrowRight />
                    </div>
                  </div>
                  {/* Category badge */}
                  <span className="absolute top-2 left-2 bg-[#111]/90 text-white text-[0.55rem] font-bold tracking-widest uppercase px-2 py-0.5">
                    {tpl.category}
                  </span>
                </div>

                {/* Footer */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[0.72rem] font-extrabold text-white uppercase tracking-wide truncate">{tpl.name}</div>
                    <div className="text-[0.6rem] text-gray-500">{tpl.sport}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/customize'); }}
                      className="flex items-center gap-1 text-[0.6rem] text-gray-500 border border-gray-700 px-2 py-1 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors font-bold uppercase tracking-wide"
                    >
                      <EyeIcon /> Use
                    </button>
                    <div className="flex items-center gap-1 text-[0.6rem] text-gray-500">
                      <ThumbIcon />
                      <span>{tpl.likes >= 1000 ? (tpl.likes / 1000).toFixed(1) + 'k' : tpl.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* "More coming" placeholder card */}
            <div className="border border-dashed border-gray-800 aspect-[3/4] flex flex-col items-center justify-center gap-3 text-gray-700 hover:border-gray-600 transition-colors cursor-default">
              <div className="text-3xl font-black">+</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-center px-4">More templates<br />coming soon</div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}