// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    // You can add props like required roles here if needed
    // roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (/* { roles } */) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while checking auth status
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Role checking
  // if (roles && !roles.some(role => userRoles.includes(role))) {
  //    return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />; // Render the child route component
};

export default ProtectedRoute;