// src/components/common/Header.jsx
import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">My App</h1>
      <nav className="space-x-4">
        <a href="#" className="text-gray-600 hover:text-blue-600">Home</a>
        <a href="#" className="text-gray-600 hover:text-blue-600">Login</a>
      </nav>
    </header>
  );
};

export default Header;
