import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
            
            {/* Toast notifications with dark mode support */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
