
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {


}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (/* { roles } */) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {

    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {




    return <Navigate to="/login" state={{ from: location }} replace />;
  }






  return <Outlet />;
};

export default ProtectedRoute;