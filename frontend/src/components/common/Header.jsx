import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">Past Paper Portal</h1>
      
      <div className="flex items-center space-x-6">
        <nav className="flex items-center space-x-4">
          <Link to="/home" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          {isAuthenticated && (
            <>
              {user?.role === 'admin' ? (
                <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
              ) : (
                <Link to="/user/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
              )}
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Profile</Link>
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link>
              <Link to="/register" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
