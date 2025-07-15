import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
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
      </div>
    </div>
  );
};

export default Home;
