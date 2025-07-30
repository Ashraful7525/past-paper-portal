import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          Welcome to Past Paper Portal!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-8">
          Your one-stop platform for accessing past examination papers, sharing
          solutions, and collaborating with fellow students.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Browse Papers
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access thousands of past papers from various departments
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Share Solutions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Help others by sharing your solutions and insights
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Collaborate
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with peers and build your academic network
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            View Newsfeed
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Sign In
          </Link>
        </div>
        
        {/* Spacing to push footer down */}
        <div style={{ height: '40vh' }}></div>
      </div>
      
      {/* Professional Footer - Reduced height */}
      <footer className="w-full py-4 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Past Paper Portal
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Academic resources for students.
              </p>
            </div>
            
            {/* Developer Info */}
            <div className="text-center md:text-right">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Developer
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Developed by
              </p>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Hotasha Software
              </p>
            </div>
          </div>
          
          {/* Bottom Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 Past Paper Portal. All rights reserved. | Developed by Hotasha Software
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Home;
