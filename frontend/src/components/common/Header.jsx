import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, user, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Past Paper Portal</h1>
      <nav className="space-x-4">
        <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
        {isAuthenticated && (
          <>
            {user?.role === 'admin' ? (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">Admin Dashboard</Link>
            ) : (
              <Link to="/user/dashboard" className="text-gray-600 hover:text-blue-600">User Dashboard</Link>
            )}
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-blue-600"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
