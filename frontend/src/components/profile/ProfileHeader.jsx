import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CameraIcon, TrashIcon, ShieldCheckIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const ProfileHeader = ({ profile, isAdmin, isEditing, newProfileDescription, setNewProfileDescription, setIsEditing, handleUpdateProfile }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const imageOptionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const profilePictureRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the profile picture container AND the dropdown
      const isClickOnProfilePicture = imageOptionsRef.current && imageOptionsRef.current.contains(event.target);
      const isClickOnDropdown = event.target.closest('[data-dropdown="profile-picture"]');
      
      if (!isClickOnProfilePicture && !isClickOnDropdown) {
        setShowImageOptions(false);
      }
    };
    
    if (showImageOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showImageOptions]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (profilePictureRef.current) {
      const rect = profilePictureRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  };

  // Update position when showing dropdown
  useEffect(() => {
    if (showImageOptions) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition);
      };
    }
  }, [showImageOptions]);

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
    <div className="bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700/50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
            <svg className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Information
          </h2>
          <div className="flex items-center gap-4">
            {/* Admin Dashboard Button */}
            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Admin Dashboard
              </a>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Member since {new Date(user?.created_at || Date.now()).getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Profile Picture Section - Circular */}
          <div className="flex-shrink-0 relative" ref={imageOptionsRef}>
            <div 
              ref={profilePictureRef}
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-700 transition-all duration-200 hover:shadow-xl cursor-pointer group"
              onClick={() => setShowImageOptions(!showImageOptions)}
              title="Click to change profile picture"
            >
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
                className={`w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-3xl lg:text-4xl font-bold ${user?.profile_picture_url ? 'hidden' : 'flex'}`}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isUploadingImage ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* User Information Section */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name, Badge and Basic Info */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {user?.username || 'Anonymous User'}
                </h1>
                
                {/* Role Badge */}
                <div className="flex-shrink-0">
                  {isAdmin ? (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300 text-sm font-bold rounded-full border border-purple-300 dark:border-purple-700 shadow-sm">
                      <ShieldCheckIcon className="w-4 h-4 mr-2" />
                      Administrator
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 text-sm font-bold rounded-full border border-blue-300 dark:border-blue-700 shadow-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Student
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">ID: {user?.student_id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium">{user?.email || 'No email provided'}</span>
                </div>
              </div>
            </div>

            {/* Bio/Description Section */}
            <div className="bg-gray-50/70 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-sm">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={newProfileDescription}
                    onChange={(e) => setNewProfileDescription(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all duration-200"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {user?.profile ? (
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {user.profile}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No bio added yet. Click below to add one!
                    </p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    {user?.profile ? 'Edit bio' : 'Add bio'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portal-based Dropdown menu */}
      {showImageOptions && !isUploadingImage && createPortal(
        <div 
          className="fixed bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-xl py-2 z-[9999] min-w-[180px] transition-all duration-200"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px` 
          }}
          data-dropdown="profile-picture"
        >
          <button
            onClick={triggerFileUpload}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors"
          >
            <CameraIcon className="w-4 h-4" />
            Upload new photo
          </button>
          {user?.profile_picture_url && (
            <button
              onClick={handleRemoveProfilePicture}
              className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Remove photo
            </button>
          )}
        </div>,
        document.body
      )}

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
