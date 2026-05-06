import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userRole, isLoading } = useAuthStore();

  // ✅ Wait for backend to confirm auth before making any decision
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole?.toLowerCase() !== requiredRole?.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}