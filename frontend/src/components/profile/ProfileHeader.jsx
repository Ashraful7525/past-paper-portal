import React from 'react';
import { Link } from 'react-router-dom';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl sm:text-4xl font-bold mx-auto sm:mx-0">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
          <p className="text-gray-600 dark:text-gray-300">{profile.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Student ID: {profile.student_id}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Role: {isAdmin ? 'Admin' : 'User'}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Profile Description</h2>
        {isEditing ? (
          <div>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows="4"
              value={newProfileDescription}
              onChange={(e) => setNewProfileDescription(e.target.value)}
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                onClick={handleUpdateProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {profile.profile || 'No description provided. Click edit to add one.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                Edit Description
              </button>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors text-center"
                >
                  Go to Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
