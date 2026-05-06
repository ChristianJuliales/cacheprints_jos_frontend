import { Link, useLocation } from 'react-router-dom';

const HIDDEN_ON = ['/login', '/register', '/admin'];

export default function Footer() {
  const { pathname } = useLocation();
  const shouldHide = HIDDEN_ON.some((path) => pathname.startsWith(path));
  if (shouldHide) return null;

  return (
    <footer className="bg-[#111] border-t border-[#1e1e1e]">
      <div className="max-w-6xl mx-auto px-8 pt-14 pb-8 grid grid-cols-2 md:grid-cols-5 gap-10">

        {/* Brand col */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#111] font-black text-sm">
              P
            </div>
            <span className="text-white font-black text-sm uppercase tracking-widest">PrintSync</span>
          </div>
          <p className="text-[0.75rem] text-gray-500 leading-relaxed max-w-[180px]">
            Crafting high-end jerseys that never fade, never peel, and never compromise on quality.
          </p>
        </div>

        {/* Link columns */}
        {[
          {
            title: 'Platform',
            links: [
              { label: 'Store',          to: '/store' },
              { label: 'Order Tracking', to: '/orders' },
              { label: 'Customizer',     to: '/customize' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About Us',  to: '/about' },
              { label: 'Templates', to: '/templates' },
              { label: 'Pricing',   to: '/pricing' },
            ],
          },
          {
            title: 'Support',
            links: [
              { label: 'FAQ',      to: '/support' },
              { label: 'Contact',  to: '/support' },
              { label: 'Shipping', to: '/support' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', to: '/legal' },
              { label: 'Terms',   to: '/legal' },
              { label: 'Cookies', to: '/legal' },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-[0.65rem] font-extrabold text-white uppercase tracking-[2px] mb-4">
              {col.title}
            </div>
            {col.links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-[0.78rem] text-gray-500 hover:text-secondary transition-colors mb-2.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-8 py-5 border-t border-[#1e1e1e] flex justify-between items-center flex-wrap gap-4">
        <span className="text-[0.7rem] text-gray-600">© 2024 PrintSync Inc. All rights reserved.</span>
        <div className="flex gap-3">
          {[
            { label: 'X',  href: '#' },
            { label: 'GH', href: '#' },
            { label: 'LI', href: '#' },
            { label: 'FB', href: 'https://www.facebook.com/profile.php?id=61566923159356' },
            { label: '✉',  href: 'mailto:cacheprints24@gmail.com' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="w-8 h-8 border border-[#2a2a2a] flex items-center justify-center text-gray-500 text-[0.65rem] hover:border-secondary hover:text-secondary transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}