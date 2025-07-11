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
          <div className="card text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Browse Papers
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access thousands of past papers from various departments
            </p>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Share Solutions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Help others by sharing your solutions and insights
            </p>
          </div>

          <div className="card text-center">
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
          <Link to="/home" className="btn-primary">
            View Newsfeed
          </Link>
          <Link to="/login" className="btn-secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
