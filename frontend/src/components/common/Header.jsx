import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, BookOpenIcon } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";

const Header = ({ searchQuery, onSearchChange }) => {
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();
  const location = useLocation();
  const isNewsfeed = location.pathname === '/home' || location.pathname === '/feed';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-slate-200 dark:border-gray-700 p-4 flex items-center justify-between z-30">
      <Link to="/home" className="flex items-center space-x-3 text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
          <BookOpenIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">Past Paper Portal</span>
      </Link>
      
      {/* Search bar for newsfeed */}
      {isNewsfeed && (
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-6">
        <nav className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              {user?.role === 'admin' ? (
                <Link to="/admin/dashboard" className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-medium">Dashboard</Link>
              ) : (
                <Link to="/user/dashboard" className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-medium">Dashboard</Link>
              )}
              <Link to="/profile" className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-medium">Profile</Link>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors disabled:opacity-50 font-medium"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors font-medium">Login</Link>
              <Link to="/register" className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors font-medium">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
