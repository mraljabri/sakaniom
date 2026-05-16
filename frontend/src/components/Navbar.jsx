import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [postMenu, setPostMenu] = useState(false);
  const postRef = useRef(null);

  // Close post dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (postRef.current && !postRef.current.contains(e.target)) setPostMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navLink = (to, label) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${location.pathname === to ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
      {label}
    </Link>
  );

  const LangToggle = ({ mobile = false }) => (
    <button onClick={toggle}
      className={`flex items-center gap-1.5 text-sm font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors ${mobile ? 'w-full justify-center' : ''}`}
      title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}>
      <span className="text-base leading-none">{lang === 'en' ? '🇴🇲' : '🇬🇧'}</span>
      <span className="text-gray-700">{lang === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {lang === 'ar' ? 'سكني عُمان' : <><span>Sakani</span><span className="text-primary-600">OM</span></>}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/listings', t('nav_rent'))}
            {navLink('/buy', t('nav_buy'))}
            {user && navLink('/dashboard', t('nav_dashboard'))}
            {user?.isAdmin && navLink('/admin', t('nav_admin'))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            {user ? (
              <div className="flex items-center gap-3">
                {/* Post dropdown */}
                <div className="relative" ref={postRef}>
                  <button onClick={() => setPostMenu(v => !v)}
                    className="btn-primary text-sm flex items-center gap-1.5">
                    {t('nav_post')}
                    <svg className={`w-3.5 h-3.5 transition-transform ${postMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {postMenu && (
                    <div className="absolute top-full end-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[180px]">
                      <Link to="/create-listing" onClick={() => setPostMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="text-primary-600">🏠</span> {t('nav_post_rent')}
                      </Link>
                      <Link to="/sell-listing" onClick={() => setPostMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="text-emerald-600">🏡</span> {t('nav_post_sale')}
                      </Link>
                    </div>
                  )}
                </div>

                {/* User chip */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm">{t('nav_logout')}</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">{t('nav_login')}</Link>
                <Link to="/signup" className="btn-primary text-sm">{t('nav_signup')}</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/listings" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium py-1">🏠 {t('nav_rent')}</Link>
            <Link to="/buy" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium py-1">🏡 {t('nav_buy')}</Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium py-1">{t('nav_dashboard')}</Link>
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <Link to="/create-listing" onClick={() => setMenuOpen(false)} className="block text-primary-600 font-semibold py-1">🏠 {t('nav_post_rent')}</Link>
                  <Link to="/sell-listing" onClick={() => setMenuOpen(false)} className="block text-emerald-600 font-semibold py-1">🏡 {t('nav_post_sale')}</Link>
                </div>
              </>
            )}
            {user?.isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-red-600 font-semibold py-1">{t('nav_admin')}</Link>
            )}
            <LangToggle mobile />
            {user ? (
              <button onClick={handleLogout} className="text-left text-red-600 font-medium py-1">{t('nav_logout')}</button>
            ) : (
              <div className="flex gap-3 pt-1">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center">{t('nav_login')}</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">{t('nav_signup')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
