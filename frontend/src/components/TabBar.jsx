import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// iOS-style bottom tab bar. Rendered only inside the app shell.
export default function TabBar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [postSheet, setPostSheet] = useState(false);

  // Close the sheet whenever the route changes (e.g. after picking an option).
  useEffect(() => { setPostSheet(false); }, [pathname]);

  const openPost = () => {
    if (!user) return navigate('/login');
    setPostSheet(true);
  };

  const accountTo = user ? '/dashboard' : '/login';
  const accountActive = user
    ? pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
    : pathname === '/login' || pathname === '/signup';

  return (
    <>
      <nav className="tab-bar" aria-label="Primary">
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          <NavLink to="/" end>
            <HomeIcon />
            <span>{t('tab_home')}</span>
          </NavLink>

          <NavLink to="/listings">
            <KeyIcon />
            <span>{t('tab_rent')}</span>
          </NavLink>

          {/* Raised centre action */}
          <button type="button" onClick={openPost} aria-haspopup="dialog" aria-expanded={postSheet}>
            <span className="-mt-6 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center ring-4 ring-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 5v14m7-7H5" />
              </svg>
            </span>
            <span className="text-primary-600">{t('tab_post')}</span>
          </button>

          <NavLink to="/buy">
            <BuildingIcon />
            <span>{t('tab_buy')}</span>
          </NavLink>

          <NavLink to={accountTo} aria-current={accountActive ? 'page' : undefined}
            className={accountActive ? 'text-primary-600' : ''}>
            <PersonIcon />
            <span>{t('tab_account')}</span>
          </NavLink>
        </div>
      </nav>

      {/* Post action sheet */}
      {postSheet && (
        <>
          <div className="sheet-backdrop" onClick={() => setPostSheet(false)} />
          <div className="action-sheet" role="dialog" aria-label={t('post_sheet_title')}>
            <div className="action-sheet-group">
              <p className="!py-3 !text-[13px] !text-gray-500 !font-normal !cursor-default active:!scale-100">
                {t('post_sheet_title')}
              </p>
              <button type="button" onClick={() => navigate('/create-listing')}>
                <span aria-hidden>🏠</span> {t('nav_post_rent')}
              </button>
              <button type="button" onClick={() => navigate('/sell-listing')} className="!text-emerald-600">
                <span aria-hidden>🏡</span> {t('nav_post_sale')}
              </button>
            </div>
            <button type="button" className="action-sheet-cancel" onClick={() => setPostSheet(false)}>
              {t('btn_cancel')}
            </button>
          </div>
        </>
      )}
    </>
  );
}

const iconProps = { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, viewBox: '0 0 24 24', 'aria-hidden': true };

function HomeIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 11-2.9 6.76L9 16.9V19h-2v2H3v-4l6.24-6.24A4 4 0 0115 7z" />
      <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M16 9h2a2 2 0 012 2v10M8 7h2m-2 4h2m-2 4h2m2-8h2m-2 4h2m-2 4h2" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a4 4 0 11-8 0 4 4 0 018 0zM5 20a7 7 0 0114 0" />
    </svg>
  );
}
