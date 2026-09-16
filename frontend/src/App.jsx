import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { isAppShell } from './config/api';
import Navbar from './components/Navbar';
import TabBar from './components/TabBar';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import CreditsPage from './pages/CreditsPage';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import VerifyIdentityPage from './pages/VerifyIdentityPage';
import VerificationGate from './components/VerificationGate';
import LandlordPage from './pages/LandlordPage';
import SaleListingsPage from './pages/SaleListingsPage';
import CreateSaleListingPage from './pages/CreateSaleListingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifySuccessPage from './pages/VerifySuccessPage';

function ProtectedRoute({ children, requireCreator = false, requireAdmin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireCreator && user.role !== 'creator') return <Navigate to="/" replace />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    // In the app shell, bottom padding keeps content clear of the tab bar.
    <div className={`min-h-screen bg-gray-50 ${isAppShell ? 'pb-24' : ''}`}>
      <ScrollToTop />
      <Navbar />
      {/* Re-keying on pathname replays the enter animation on every navigation. */}
      <div key={isAppShell ? pathname : 'static'} className={isAppShell ? 'page-enter' : undefined}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-listing" element={<ProtectedRoute><VerificationGate><CreateListingPage /></VerificationGate></ProtectedRoute>} />
          <Route path="/verify-identity" element={<ProtectedRoute><VerifyIdentityPage /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/landlord/:id" element={<LandlordPage />} />
          <Route path="/buy" element={<SaleListingsPage />} />
          <Route path="/sell-listing" element={<ProtectedRoute><VerificationGate><CreateSaleListingPage /></VerificationGate></ProtectedRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-success" element={<VerifySuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {isAppShell && <TabBar />}
    </div>
  );
}
