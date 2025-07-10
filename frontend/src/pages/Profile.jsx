import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { Award, BookOpen, MessageCircle, Bookmark } from 'lucide-react';

const Profile = () => {
  const { user, logout, isLoggingOut, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProfileDescription, setNewProfileDescription] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setProfile(response.data);
        setNewProfileDescription(response.data.profile || '');
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/auth/profile', {
        profile: newProfileDescription,
      });
      setProfile(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500">Student ID: {profile.student_id}</p>
                  <p className="text-sm text-gray-500">Role: {isAdmin ? 'Admin' : 'User'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Description</h2>
                {isEditing ? (
                  <div>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows="4"
                      value={newProfileDescription}
                      onChange={(e) => setNewProfileDescription(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        onClick={handleUpdateProfile}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">
                      {profile.profile || 'No description provided. Click edit to add one.'}
                    </p>
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Description
                    </button>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                      >
                        Go to Admin Dashboard
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar with Stats */}
          {stats && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  User Statistics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Questions Asked</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.questionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-700">Solutions Provided</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.solutionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bookmark className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Bookmarked Items</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.bookmarksCount}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-gray-700">Total Contribution</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.contribution}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;