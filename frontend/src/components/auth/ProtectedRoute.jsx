import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking access', {
    user: user ? { id: user.id, role: user.role } : null,
    loading,
    requireAdmin,
    pathname: location.pathname
  });

  // Show loading while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 