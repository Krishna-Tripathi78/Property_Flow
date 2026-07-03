import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/Landing/LandingPage';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ComplaintsList from './components/Complaints/ComplaintsList';
import CreateComplaint from './components/Complaints/CreateComplaint';
import ComplaintDetails from './components/Complaints/ComplaintDetails';
import NoticeBoard from './components/Notices/NoticeBoard';
import LostFound from './components/LostFound/LostFound';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminComplaints from './components/Admin/AdminComplaints';
import AdminNotices from './components/Admin/AdminNotices';
import UserManagement from './components/Admin/UserManagement';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {user && <Navbar />}
      <main className={user ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute>
                <CreateComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <NoticeBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lostfound"
            element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute adminOnly>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute adminOnly>
                <AdminNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#f9fafb' },
                style: {
                  background: '#052e16',
                  color: '#86efac',
                  border: '1px solid #166534',
                  borderRadius: '12px',
                },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
                style: {
                  background: '#2d0a0a',
                  color: '#fca5a5',
                  border: '1px solid #991b1b',
                  borderRadius: '12px',
                },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;