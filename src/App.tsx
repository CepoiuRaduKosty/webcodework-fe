
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import ClassroomPage from './pages/ClassroomPage'; 
import AssignmentPage from './pages/AssignmentPage';
import AssignmentManagePage from './pages/AssignmentManagePage';
import SettingsPage from './pages/SettingsPage';
import GradeSubmissionPage from './pages/GradeSubmissionPage';


const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  
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
          <Route path="/" element={<ProtectedRoute />}> {/* Wrap all protected routes */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="classrooms/:classroomId" element={<ClassroomPage />} /> {/* Add classroom route */}
                <Route path="assignments/:assignmentId" element={<AssignmentPage />} /> 
                <Route path="assignments/:assignmentId/manage" element={<AssignmentManagePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="submissions/:submissionId/grade" element={<GradeSubmissionPage />} />
                <Route index element={<RootRedirect />} /> {/* Handle root redirect within protected routes */}
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