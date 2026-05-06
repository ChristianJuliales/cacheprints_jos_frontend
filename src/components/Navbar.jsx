import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CartIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Navbar() {
  const { user, userRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = (path) => {
    const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
    return [
      'relative text-[0.82rem] font-medium px-3 py-2 rounded-md transition-all duration-150',
      isActive
        ? 'text-[#111] font-semibold bg-black/[0.06] after:absolute after:bottom-[-1px] after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#111] after:rounded-t-sm'
        : 'text-gray-500 hover:text-[#111] hover:bg-black/[0.04]',
    ].join(' ');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className={`bg-[#faf9f7] border-b border-black/[0.08] sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.07)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between gap-8">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/images/logo1.png"
            alt="Cache Prints"
            className="h-10 w-auto object-contain"
          />
          {/* Divider */}
          <span className="w-px h-5 bg-gray-300 mx-0.5" />
          {/* PrintSync label */}
          <div className="flex flex-col leading-none">
            <span className="text-[0.90rem] font-semibold tracking-[0.50em] uppercase text-gray-400">
              Print
            </span>
            <span className="text-[0.90rem] font-semibold tracking-[0.18em] uppercase text-[#111]">
              Sync
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <Link to="/store" className={navLinkClass('/store')}>Store</Link>

          {user && userRole === 'customer' && (
            <>
              <Link to="/customize" className={navLinkClass('/customize')}>Customize</Link>
              <Link to="/orders"    className={navLinkClass('/orders')}>Orders</Link>
            </>
          )}

          {user && userRole === 'admin' && (
            <>
              <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>Dashboard</Link>
              <Link to="/admin/products"  className={navLinkClass('/admin/products')}>Products</Link>
              <Link to="/admin/orders"    className={navLinkClass('/admin/orders')}>Orders</Link>
            </>
          )}

          {!user && <Link to="/" className={navLinkClass('/')}>Home</Link>}
        </div>

        {/* ── Right section ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {userRole === 'customer' && (
                <Link
                  to="/orders"
                  className="relative flex items-center gap-1.5 text-[0.8rem] font-medium text-gray-500 hover:text-[#111] hover:bg-black/[0.04] transition-all px-3 py-2 rounded-md"
                >
                  <CartIcon />
                  Cart
                  <span className="absolute top-1.5 right-1 w-[7px] h-[7px] bg-amber-500 rounded-full border-[1.5px] border-[#faf9f7]" />
                </Link>
              )}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <span className="hidden sm:block text-[0.72rem] text-gray-400 max-w-[150px] truncate">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-[0.42rem] text-[0.78rem] font-semibold text-[#111] border border-black/[0.16] rounded-lg hover:bg-[#111] hover:text-white transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="relative flex items-center gap-1.5 text-[0.8rem] font-medium text-gray-500 hover:text-[#111] hover:bg-black/[0.04] transition-all px-3 py-2 rounded-md"
              >
                <CartIcon />
                Cart
                <span className="absolute top-1.5 right-1 w-[7px] h-[7px] bg-amber-500 rounded-full border-[1.5px] border-[#faf9f7]" />
              </Link>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <Link
                to="/login"
                className="px-4 py-[0.44rem] text-[0.78rem] font-semibold text-white bg-[#111] rounded-lg hover:bg-[#2a2a2a] hover:-translate-y-px transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}

          <button
            className="md:hidden ml-1 p-2 text-[#111] hover:bg-black/[0.04] rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f7] border-t border-black/[0.08] px-6 py-4 space-y-1">
          <Link to="/store" className="block text-sm font-semibold text-[#111] px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Store</Link>

          {user && userRole === 'customer' && (
            <>
              <Link to="/customize" className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Customize</Link>
              <Link to="/orders"    className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            </>
          )}

          {user && userRole === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/products"  className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link to="/admin/orders"    className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            </>
          )}

          {!user && <Link to="/" className="block text-sm text-gray-600 px-3 py-2 rounded-md hover:bg-black/[0.05]" onClick={() => setMobileMenuOpen(false)}>Home</Link>}

          <div className="pt-3 mt-2 border-t border-black/[0.08]">
            {user ? (
              <>
                <p className="text-xs text-gray-400 px-3 mb-2 truncate">{user.email}</p>
                <button onClick={handleLogout} className="w-full text-left text-sm font-semibold text-red-500 px-3 py-2 rounded-md hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"    className="flex-1 text-center py-2 border border-black/[0.16] text-sm font-semibold text-[#111] rounded-lg" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="flex-1 text-center py-2 bg-[#111] text-white text-sm font-semibold rounded-lg" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}