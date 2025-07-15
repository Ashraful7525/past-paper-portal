import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, AcademicCapIcon, ShieldCheckIcon, PencilIcon } from '@heroicons/react/24/outline';

const ProfileHeader = ({ 
  profile, 
  isAdmin, 
  isEditing, 
  newProfileDescription, 
  setNewProfileDescription, 
  setIsEditing, 
  handleUpdateProfile 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-100 dark:border-gray-600">
        <div className="flex items-center">
          <UserCircleIcon className="w-7 h-7 text-blue-600 dark:text-blue-400 mr-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Personal Information</h2>
        </div>
      </div>

      <div className="p-8">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row md:items-start space-y-8 md:space-y-0 md:space-x-8 mb-10">
          {/* Avatar */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50 transition-all duration-200 hover:ring-6 hover:shadow-xl">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">
                {profile.username}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-300 font-medium">
                  <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-500 dark:text-gray-400 font-medium">
                  <AcademicCapIcon className="w-5 h-5 mr-3" />
                  Student ID: {profile.student_id}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex justify-center md:justify-start mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${
                isAdmin 
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
              }`}>
                {isAdmin ? (
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                ) : (
                  <UserCircleIcon className="w-4 h-4 mr-2" />
                )}
                {isAdmin ? 'Administrator' : 'Student'}
              </div>
            </div>

            {/* Admin Dashboard Link */}
            {isAdmin && (
              <div className="flex justify-center md:justify-start">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-purple-600 hover:border-purple-700"
                >
                  <ShieldCheckIcon className="w-5 h-5 mr-3" />
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Description Section */}
        <div className="border-t border-gray-100 dark:border-gray-600 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
              <PencilIcon className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
              About Me
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 border border-blue-100 dark:border-blue-800/50 hover:border-blue-200 dark:hover:border-blue-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Profile Description
                </label>
                <textarea
                  className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none shadow-sm hover:shadow-md font-medium"
                  rows="5"
                  value={newProfileDescription}
                  onChange={(e) => setNewProfileDescription(e.target.value)}
                  placeholder="Tell us about yourself, your interests, and academic goals..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpdateProfile}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-blue-600 hover:border-blue-700"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-500 hover:border-gray-300 dark:hover:border-gray-400"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/70 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/70">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {profile.profile || (
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    No description provided. Click "Edit" to add information about yourself.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
