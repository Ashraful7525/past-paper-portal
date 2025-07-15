import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../hooks/useCourses';
import { useProfile } from '../hooks/useProfile';
import toast, { Toaster } from 'react-hot-toast';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import CourseEnrollmentSection from '../components/profile/CourseEnrollmentSection';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  
  // Course enrollment states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Custom hooks
  const {
    profile,
    stats,
    isEditing,
    setIsEditing,
    newProfileDescription,
    setNewProfileDescription,
    handleUpdateProfile,
    loading: profileLoading
  } = useProfile(user);

  const {
    courses,
    enrollments,
    departments,
    loading: coursesLoading,
    enrollmentLoading,
    lastRefresh,
    enrollInCourse,
    dropCourse,
    getCoursesByDepartment,
    isEnrolledInCourse,
    refreshAll
  } = useCourses();

  if (profileLoading || !profile || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Academic Profile
            </h1>
            <p className="text-base text-blue-100 dark:text-blue-200 font-medium max-w-2xl mx-auto">
              Manage your academic journey and achievements with ease
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout: Main Content (Left) + Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Column - spans 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information - Full width of main content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
              <ProfileHeader 
                profile={profile}
                isAdmin={isAdmin}
                isEditing={isEditing}
                newProfileDescription={newProfileDescription}
                setNewProfileDescription={setNewProfileDescription}
                setIsEditing={setIsEditing}
                handleUpdateProfile={handleUpdateProfile}
              />
            </div>

            {/* Course Management - Same width as personal info, directly beneath */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
                  <svg className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course Management
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                  Manage your course enrollments and academic progress
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <CourseEnrollmentSection 
                  enrollments={enrollments}
                  lastRefresh={lastRefresh}
                  coursesLoading={coursesLoading}
                  refreshAll={refreshAll}
                  showAddCourse={showAddCourse}
                  setShowAddCourse={setShowAddCourse}
                  enrollmentLoading={enrollmentLoading}
                  dropCourse={dropCourse}
                  departments={departments}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  courses={courses}
                  getCoursesByDepartment={getCoursesByDepartment}
                  isEnrolledInCourse={isEnrolledInCourse}
                  enrollInCourse={enrollInCourse}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column - spans 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
              <ProfileStats stats={stats} />
            </div>

            {/* Recent Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit transition-all duration-200 hover:shadow-md">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
                  <svg className="w-4 h-4 mr-2 text-amber-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19l5-5 5 5M2 9h20" />
                  </svg>
                  Recent Notifications
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1 truncate">
                          New assignment posted in Mathematics
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50/70 dark:bg-green-900/20 rounded-lg border border-emerald-200 dark:border-green-800/50 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1 truncate">
                          Your solution was accepted
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50/70 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1 truncate">
                          New comment on your post
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50/70 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1 truncate">
                          Deadline reminder: Physics Lab
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
                  <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm">Browse Questions</span>
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm">Upload Paper</span>
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm">View Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Upcoming Deadlines - Full width */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
                <svg className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming Deadlines
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                Stay on top of your assignments and important dates
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50/70 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                        Mathematics Assignment
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Due March 20, 2025</p>
                    </div>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full font-bold ml-3">
                      3 days
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-red-50/70 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                        Physics Lab Report
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Due March 18, 2025</p>
                    </div>
                    <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-bold ml-3">
                      Tomorrow
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50/70 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                        Chemistry Quiz
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Due March 25, 2025</p>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full font-bold ml-3">
                      1 week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
    </div>
  );
};

export default Profile;