import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets scroll position when navigating to a new page
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
