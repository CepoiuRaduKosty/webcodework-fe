// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// A simple component to handle root redirection logic
const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or your main app loader
  }

  // If authenticated, go to dashboard, otherwise go to login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};


function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap routes needing auth context */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
           <Route path="/dashboard" element={<ProtectedRoute />}>
                {/* Outlet renders the nested component */}
                <Route index element={<DashboardPage />} />
                {/* Add other protected routes here nested under ProtectedRoute */}
                {/* e.g., <Route path="settings" element={<SettingsPage />} /> */}
           </Route>

          {/* Root path redirection */}
           <Route path="/" element={<RootRedirect />} />

          {/* Fallback for unmatched routes (optional) */}
          <Route path="*" element={<Navigate to="/" replace />} />
           {/* Or a dedicated 404 component: <Route path="*" element={<NotFoundPage />} /> */}

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;