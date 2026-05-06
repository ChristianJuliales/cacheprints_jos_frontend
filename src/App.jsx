import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatWindow from './components/FloatingChatWindow';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import StorePage from './pages/StorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ← ADD THIS
import CustomizePage from './pages/CustomizePage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminReports from './pages/AdminReports';
import AdminOrderSheet from './pages/AdminOrderSheet';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import TemplatesPage from './pages/TemplatesPage';
import SupportPage from './pages/SupportPage';
import LegalPage from './pages/LegalPage';

import './styles/index.css';

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, userRole } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
}

function App() {
  const { isLoading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StorePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* ✅ Guest-only — redirects if already logged in */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ✅ FIX 1: Forgot password was missing — wildcard was catching it */}
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Customer Routes */}
        <Route path="/customize" element={<ProtectedRoute requiredRole="customer"><CustomizePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute requiredRole="customer"><OrdersPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
        <Route path="/public-sheet/:id" element={<AdminOrderSheet />} />
        <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      <FloatingChatWindow />
    </Router>
  );
}

export default App;