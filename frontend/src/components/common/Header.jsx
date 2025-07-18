import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import EnhancedSearch from './EnhancedSearch';

const Header = ({ searchFilters, onSearchChange }) => {
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();
  const location = useLocation();
  const isNewsfeed = location.pathname === '/home' || location.pathname === '/feed';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="w-full px-2 sm:px-3 lg:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Tightly aligned to the left */}
          <div className="flex items-center flex-shrink-0 pl-0">
            <Link to="/home" className="flex items-center space-x-2 sm:space-x-3 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold hidden sm:block">Past Paper Portal</span>
              <span className="text-lg font-bold sm:hidden">PPP</span>
            </Link>
          </div>
          
          {/* Centered search bar for newsfeed */}
          {isNewsfeed && (
            <div className="flex-1 flex justify-center mx-3 sm:mx-4 lg:mx-6">
              <EnhancedSearch
                onSearch={onSearchChange}
                initialFilters={searchFilters}
              />
            </div>
          )}
          
          {/* Navigation - Tightly aligned to the right */}
          <div className="flex items-center flex-shrink-0 pr-0">
            <nav className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {isAuthenticated && (
                <>
                  {user?.role === 'admin' ? (
                    <Link 
                      to="/admin/dashboard" 
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors text-sm sm:text-base px-2.5 py-1.5 rounded-lg shadow-sm border border-amber-600 mr-2"
                    >
                      <span className="hidden sm:inline">Admin Dashboard</span>
                      <span className="sm:hidden">Admin</span>
                    </Link>
                  ) : (
                    <Link 
                      to="/user/dashboard" 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors font-medium text-sm sm:text-base px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">Dash</span>
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors font-medium text-sm sm:text-base px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">Prof</span>
                  </Link>
                  <button
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors disabled:opacity-50 font-medium text-sm sm:text-base px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
                  >
                    {isLoggingOut ? (
                      <span className="hidden sm:inline">Logging out...</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Logout</span>
                        <span className="sm:hidden">Out</span>
                      </>
                    )}
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors font-medium text-sm sm:text-base px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors font-medium text-sm sm:text-base ml-1.5"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
