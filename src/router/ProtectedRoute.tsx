import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../lib/enums';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: Role;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-slate-500 text-xl" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (user.role !== allowedRole) {
    // Redirect to their correct portal
    switch (user.role) {
      case Role.Admin:
        return <Navigate to="/admin/dashboard" replace />;
      case Role.Student:
        return <Navigate to="/student/dashboard" replace />;
      case Role.Doctor:
        return <Navigate to="/doctor/dashboard" replace />;
      case Role.AcademicAdvisor:
        return <Navigate to="/advisor/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}