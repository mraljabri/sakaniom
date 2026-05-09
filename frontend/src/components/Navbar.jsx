import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { user, logout, isCreator } = useAuth();
  const { t, lang, toggle, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors ${location.pathname === to ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
    >
      {label}
    </Link>
  );

  const LangToggle = ({ mobile = false }) => (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-sm font-semibold border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors ${mobile ? 'w-full justify-center' : ''}`}
      title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
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
              {lang === 'ar' ? 'سكاني عُمان' : <><span>Sakani</span><span className="text-primary-600">OM</span></>}
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/listings', t('nav_browse'))}
            {user && isCreator && navLink('/dashboard', t('nav_dashboard'))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            {user ? (
              <div className="flex items-center gap-3">
                {isCreator && (
                  <Link to="/create-listing" className="btn-primary text-sm">{t('nav_post')}</Link>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  <span className={`badge ${user.role === 'creator' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {t(`nav_${user.role}`)}
                  </span>
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
            <Link to="/listings" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium py-1">{t('nav_browse')}</Link>
            {user && isCreator && (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium py-1">{t('nav_dashboard')}</Link>
                <Link to="/create-listing" onClick={() => setMenuOpen(false)} className="text-primary-600 font-semibold py-1">{t('nav_post')}</Link>
              </>
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
