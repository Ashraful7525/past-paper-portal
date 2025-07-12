import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-slate-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <Link to="/home" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        Past Paper Portal
      </Link>
      
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
