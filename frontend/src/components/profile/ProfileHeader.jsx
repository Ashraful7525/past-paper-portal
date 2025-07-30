import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const ProfileHeader = ({ profile, stats, isAdmin, isEditing, newProfileDescription, setNewProfileDescription, setIsEditing, handleUpdateProfile }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const imageOptionsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageOptionsRef.current && !imageOptionsRef.current.contains(event.target)) {
        setShowImageOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setShowImageOptions(false);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${user.student_id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase using frontend client (same as posts/solutions)
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update backend database via API (just saves URL to database)
      const response = await fetch('/api/auth/profile-picture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          profile_picture_url: publicUrl,
          profile_picture_filename: fileName
        })
      });

      const data_response = await response.json();

      if (!response.ok) {
        throw new Error(data_response.message || 'Failed to update profile picture');
      }

      // Update the user data in React Query cache
      queryClient.setQueryData(['user'], data_response.user);
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsUploadingImage(true);
    setShowImageOptions(false);

    try {
      const response = await fetch('/api/auth/profile-picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove profile picture');
      }

      // Update the user data in React Query cache
      queryClient.setQueryData(['user'], data.user);
      
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture: ' + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
    setShowImageOptions(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-6">
        {/* Profile Picture with Upload Options */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user?.username || 'Profile'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>

          {/* Upload button overlay */}
          <div className="absolute -bottom-2 -right-2">
            <div className="relative" ref={imageOptionsRef}>
              <button
                onClick={() => setShowImageOptions(!showImageOptions)}
                disabled={isUploadingImage}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown menu */}
              {showImageOptions && !isUploadingImage && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                  <button
                    onClick={triggerFileUpload}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <CameraIcon className="w-4 h-4" />
                    Upload new photo
                  </button>
                  {user?.profile_picture_url && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.username || 'Anonymous User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Student ID: {user?.student_id || 'N/A'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.email || 'No email provided'}
          </p>
          {isEditing ? (
            <div className="mt-3">
              <textarea
                value={newProfileDescription}
                onChange={(e) => setNewProfileDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="2"
                placeholder="Add a bio or description..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              {user?.profile && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {user.profile}
                </p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 text-xs mt-1"
              >
                {user?.profile ? 'Edit bio' : 'Add bio'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.questionsCount || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.solutionsCount || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Solutions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.contribution || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Contribution</div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ProfileHeader;
