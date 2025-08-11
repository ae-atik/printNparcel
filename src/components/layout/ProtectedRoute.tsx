import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
}) => {
  const { isAuthenticated, user, currentRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You could replace this with a spinner component if desired
    return null;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && (!user?.roles.includes(requiredRole) || currentRole !== requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};