import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

// ── Icons ────────────────────────────────────────────────────────────────────
const BoltIcon = () => (
  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);
const LayersIcon = () => (
  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
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
const CartIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const ArrowRight = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ── Placeholders ──────────────────────────────────────────────────────────────
const JerseyPlaceholder = ({ color = '#2d2d2d', name = '' }) => (
  <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M60 20 L20 50 L10 90 L40 95 L40 200 L160 200 L160 95 L190 90 L180 50 L140 20 C130 35 70 35 60 20Z" fill={color} stroke="#555" strokeWidth="2" />
    <text x="100" y="125" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="36" fontWeight="bold" fontFamily="serif">5</text>
    <text x="100" y="158" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">{name}</text>
  </svg>
);

const ImagePlaceholder = ({ dark }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${dark ? 'bg-[#1c1c1c]' : 'bg-gray-50'}`}>
    <svg width="32" height="32" fill="none" stroke={dark ? '#444' : '#ccc'} strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </svg>
    <span className={`text-[0.58rem] uppercase tracking-widest font-bold ${dark ? 'text-[#444]' : 'text-gray-300'}`}>Photo</span>
  </div>
);

// ── Mock templates ────────────────────────────────────────────────────────────
const MOCK_TEMPLATES = [
  { id: 1, name: 'TEAM-CORP-05', category: 'Athletic Sports', likes: 1294, color: '#1a1a1a', image: 'jerseyyellow.png' },
  { id: 2, name: 'ATHLETIC-PRO', category: 'Sports', likes: 814, color: '#2c3e50', image: 'revel.png' },
  { id: 3, name: 'MINIMAL-EVENT', category: 'Events', likes: 393, color: '#006655', image: 'stem.png' },
  { id: 4, name: 'INDUSTRIAL-X', category: 'Activewear', likes: 62, color: '#2d2d2d', image: 'polo.png' },
];
const ITEMS_PER_PAGE = 4;

// ── Category section definitions (no hardcoded items) ────────────────────────
const CATEGORY_SECTIONS = [
  { title: 'Custom Sportswear', label: 'Performance Uniforms' },
  { title: 'Custom Apparel',    label: 'Everyday Wear'        },
  { title: 'Excluded / Add-Ons', label: 'Billed Separately'  },
];

export default function StorePage() {
  const navigate = useNavigate();
  const { user, userRole } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const isAdmin = userRole?.toLowerCase() === 'admin';

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/jos/products');
      // Map _id to id for frontend compatibility
      const mappedProducts = response.data.map(p => ({ ...p, id: p._id }));
      setProducts(mappedProducts);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = (product) => {
    if (!user) {
      toast.error('Please sign in to customize');
      navigate('/login');
      return;
    }
    navigate('/customize', { state: { selectedProduct: product } });
  };

  // Featured Products carousel (all products)
  const maxCarousel = Math.max(0, products.length - ITEMS_PER_PAGE);
  const visibleProducts = products.slice(carouselIndex, carouselIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentPage = Math.floor(carouselIndex / ITEMS_PER_PAGE);

  // Group products by category for the 3 sections
  const grouped = CATEGORY_SECTIONS.map((sec) => ({
    ...sec,
    items: products.filter((p) => p.category === sec.title),
  }));

  const formatPrice = (price) =>
    `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[520px] bg-[url('/images/bg.jpg')] bg-cover bg-center flex items-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-6xl mx-auto px-8 py-24 w-full">
          <span className="inline-block text-[white] text-[1rem] font-bold tracking-[2.5px] uppercase px-2 py-1">
            Premium Custom Apparel
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase leading-none mb-1">Sync your style.</h1>
          <h1 className="text-5xl md:text-6xl font-black text-secondary uppercase leading-none mb-6">Elevate your game.</h1>
          <p className="text-white/65 text-sm max-w-xs leading-relaxed mb-8">
            We bridge the gap between digital precision and premium textile craftsmanship to outfit the next generation of champions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/customize" className="inline-flex items-center gap-2 bg-white text-[#111] font-bold text-[0.72rem] tracking-widest uppercase px-6 py-3 hover:bg-secondary hover:text-white transition-colors duration-200">
              Start Designing <ArrowRight />
            </Link>
            <a href="#templates" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold text-[0.72rem] tracking-widest uppercase px-6 py-3 hover:border-secondary hover:text-secondary transition-colors duration-200">
              Browse Templates
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="bg-white border-t-[3px] border-[#111] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <BoltIcon />, title: 'Rapid Fulfillment', desc: 'Automated job routing ensures your designs hit the press floor within 24 hours of approval.' },
            { icon: <LayersIcon />, title: 'Premium Materials', desc: 'Sourced from industry-leading manufacturers. Built to withstand industrial washing and heavy wear.' },
            { icon: <ShieldIcon />, title: 'Quality Assured', desc: 'Every garment passes through our 5-point manual inspection process before shipping.' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-12 h-12 border-2 border-[#111] flex items-center justify-center text-[#111]">{f.icon}</div>
              <div>
                <div className="text-[0.8rem] font-extrabold uppercase tracking-wider text-[#111] mb-1">{f.title}</div>
                <div className="text-[0.78rem] text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-[#111]" id="featured">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-2xl font-black uppercase tracking-wide text-white">Featured Products</h2>
            <Link to="/store" className="text-[0.72rem] font-bold uppercase tracking-widest text-secondary border-b border-secondary pb-0.5 hover:opacity-70 transition-opacity">
              View Catalog
            </Link>
          </div>
          <p className="text-[0.65rem] text-gray-500 uppercase tracking-widest mb-8">Select a base garment to begin</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-[#1c1c1c] animate-pulse">
                  <div className="aspect-[3/4] bg-[#2a2a2a]" />
                  <div className="p-4 space-y-2">
                    <div className="h-2 bg-[#2a2a2a] rounded w-1/2" />
                    <div className="h-3 bg-[#2a2a2a] rounded w-3/4" />
                    <div className="h-8 bg-[#2a2a2a] rounded w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {visibleProducts.map((product) => (
                  <div key={product.id} className="bg-[#1c1c1c] border border-[#2a2a2a] hover:border-gray-500 transition-all duration-200 hover:-translate-y-1">
                    <div className="aspect-[3/4] bg-white flex items-center justify-center relative overflow-hidden">
                      {product.imageBase64 ? (
                        <img src={product.imageBase64} alt={product.name} className="w-full h-full object-contain p-4" />
                      ) : (
                        <div className="w-2/3 opacity-50"><JerseyPlaceholder color="#333" name={product.name} /></div>
                      )}
                      {product.category && (
                        <span className="absolute top-2 left-2 bg-[#111] text-white text-[0.58rem] font-bold tracking-widest uppercase px-2 py-0.5">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-[0.62rem] text-gray-500 uppercase tracking-widest mb-0.5">{product.category || 'Apparel'}</div>
                      <div className="text-[0.92rem] font-extrabold text-white uppercase mb-1 truncate">{product.name}</div>
                      <div className="text-[0.88rem] font-bold text-gray-300 mb-4">{formatPrice(product.price)}</div>
                      {!isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => handleCustomize(product)} className="flex-1 border border-white/25 text-white text-[0.68rem] font-bold tracking-widest uppercase py-2 hover:bg-white hover:text-[#111] transition-colors duration-200">
                            Customize
                          </button>
                          <button onClick={() => handleCustomize(product)} className="w-9 border border-white/25 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-colors duration-200">
                            <CartIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setCarouselIndex(Math.max(0, carouselIndex - ITEMS_PER_PAGE))} disabled={carouselIndex === 0} className="w-9 h-9 border border-white/25 flex items-center justify-center text-white hover:border-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCarouselIndex(i * ITEMS_PER_PAGE)} className={`rounded-full transition-all duration-200 ${currentPage === i ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/30'}`} />
                ))}
                <button onClick={() => setCarouselIndex(Math.min(maxCarousel, carouselIndex + ITEMS_PER_PAGE))} disabled={carouselIndex >= maxCarousel} className="w-9 h-9 border border-white/25 flex items-center justify-center text-white hover:border-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500 text-sm">No products available yet.</div>
          )}
        </div>
      </section>

      {/* ── PRODUCT CATEGORY SECTIONS (backend-driven, alternating dark/light) ── */}
      {grouped.map((cat, idx) => {
        const dark = idx % 2 === 0;
        return (
          <section key={idx} className={dark ? 'bg-[#111]' : 'bg-white'}>
            <div className="max-w-6xl mx-auto px-8 py-16">

              {/* Header */}
              <div className="flex justify-between items-end mb-1">
                <h2 className={`text-2xl font-black uppercase tracking-wide ${dark ? 'text-white' : 'text-[#111]'}`}>
                  {cat.title}
                </h2>
              </div>
              <p className={`text-[0.65rem] uppercase tracking-widest mb-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {cat.label}
              </p>

              {/* Empty state */}
              {cat.items.length === 0 ? (
                <div className={`text-center py-20 text-sm border border-dashed ${dark ? 'border-white/10 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                  No products yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {cat.items.map((product) => (
                    <div
                      key={product.id}
                      className={`border transition-all duration-200 hover:-translate-y-1 ${
                        dark
                          ? 'bg-[#1c1c1c] border-[#2a2a2a] hover:border-gray-500'
                          : 'bg-white border-gray-200 hover:border-[#111]'
                      }`}
                    >
                      {/* Image */}
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {product.imageBase64 ? (
                          <img src={product.imageBase64} alt={product.name} className="w-full h-full object-contain p-4" />
                        ) : (
                          <ImagePlaceholder dark={dark} />
                        )}
                        {product.category && (
                          <span className="absolute top-2 left-2 bg-[#111] text-white text-[0.58rem] font-bold tracking-widest uppercase px-2 py-0.5">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <div className={`text-[0.62rem] uppercase tracking-widest mb-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {product.category}
                        </div>
                        <div className={`text-[0.92rem] font-extrabold uppercase mb-1 leading-tight ${dark ? 'text-white' : 'text-[#111]'}`}>
                          {product.name}
                        </div>
                        <div className={`text-[0.88rem] font-bold mb-4 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>
                          {product.price
                            ? formatPrice(product.price)
                            : <span className="italic font-normal text-[0.75rem] text-gray-500">Price TBA</span>
                          }
                        </div>
                        {!isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCustomize(product)}
                              className={`flex-1 border text-[0.68rem] font-bold tracking-widest uppercase py-2 transition-colors duration-200 ${
                                dark
                                  ? 'border-white/25 text-white hover:bg-white hover:text-[#111]'
                                  : 'border-[#111]/30 text-[#111] hover:bg-[#111] hover:text-white'
                              }`}
                            >
                              Customize
                            </button>
                            <button
                              onClick={() => handleCustomize(product)}
                              className={`w-9 border flex items-center justify-center transition-colors duration-200 ${
                                dark
                                  ? 'border-white/25 text-white hover:bg-secondary hover:border-secondary'
                                  : 'border-[#111]/30 text-[#111] hover:bg-secondary hover:text-white hover:border-secondary'
                              }`}
                            >
                              <CartIcon />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ── DESIGN TEMPLATES ── */}
      <section className="bg-white border-t border-gray-100" id="templates">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-2xl font-black uppercase tracking-wide text-[#111]">Design Templates</h2>
            <Link to="/templates" className="text-[0.72rem] font-bold uppercase tracking-widest text-[#111] border-b-2 border-[#111] pb-0.5 hover:text-secondary hover:border-secondary transition-colors">
              View All Templates
            </Link>
          </div>
          <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest mb-8">Start with a pre-configured base</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="border border-gray-200 hover:border-[#111] transition-colors duration-200 cursor-pointer" onClick={() => navigate('/customize')}>
                <div className="aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                  {tpl.image ? (
                    <img src={`/images/${tpl.image}`} alt={tpl.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-2/3 p-6"><JerseyPlaceholder color={tpl.color} name={tpl.name} /></div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[0.7rem] font-extrabold text-[#111] uppercase tracking-wide truncate">{tpl.name}</div>
                    <div className="text-[0.62rem] text-gray-400">{tpl.category}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="flex items-center gap-1 text-[0.62rem] text-gray-500 border border-gray-300 px-2 py-1 hover:border-[#111] hover:text-[#111] transition-colors font-bold uppercase tracking-wide">
                      <EyeIcon /> Preview
                    </button>
                    <div className="flex items-center gap-1 text-[0.62rem] text-gray-400">
                      <ThumbIcon />
                      <span>{tpl.likes >= 1000 ? (tpl.likes / 1000).toFixed(1) + 'k' : tpl.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}