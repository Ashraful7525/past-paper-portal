import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import DarkModeToggle from './components/common/DarkModeToggle';
import Newsfeed from './pages/Newsfeed';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component to handle toast theming
const ToastContainer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDarkMode ? '#374151' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827',
          border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: isDarkMode 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          duration: 3000,
          style: {
            background: isDarkMode ? '#065f46' : '#ecfdf5',
            color: isDarkMode ? '#a7f3d0' : '#065f46',
            border: isDarkMode ? '1px solid #047857' : '1px solid #a7f3d0',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: isDarkMode ? '#7f1d1d' : '#fef2f2',
            color: isDarkMode ? '#fca5a5' : '#7f1d1d',
            border: isDarkMode ? '1px solid #dc2626' : '1px solid #fca5a5',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Layout component to include Header and dark mode toggle
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Dark Mode Toggle - Fixed position in bottom-right, less invasive */}
      <div className="fixed bottom-6 right-6 z-40">
        <DarkModeToggle />
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main content with top padding to account for fixed header */}
      <div className="content-wrapper pt-16">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes without layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes with layout */}
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              <Route path="/home" element={<Newsfeed />} />
              <Route path="/feed" element={<Newsfeed />} />
              <Route path="/post/:postId" element={
                <Layout>
                  <PostDetail />
                </Layout>
              } />
              
              {/* Protected routes with layout */}
              <Route path="/user/dashboard" element={
                <Layout>
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin/dashboard" element={
                <Layout>
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/profile" element={
                <Layout>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Layout>
              } />
              
              {/* 404 route */}
              <Route path="*" element={
                <Layout>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
                      <button
                        onClick={() => window.history.back()}
                        className="btn-primary"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </Layout>
              } />
            </Routes>
            
            {/* Toast notifications with dynamic dark mode support */}
            <ToastContainer />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
