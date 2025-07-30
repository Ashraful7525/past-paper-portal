import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../hooks/useCourses';
import { useProfile, useUserQuestions, useUserSolutions, useUserBookmarks, useContributionData } from '../hooks/useProfile';
import toast, { Toaster } from 'react-hot-toast';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ContributionStats from '../components/profile/ContributionStats';
import CourseEnrollmentSection from '../components/profile/CourseEnrollmentSection';
import UserQuestionsList from '../components/profile/UserQuestionsList';
import UserSolutionsList from '../components/profile/UserSolutionsList';
import UserBookmarksList from '../components/profile/UserBookmarksList';
import { 
  MessageCircleIcon, 
  FileTextIcon, 
  BookmarkIcon, 
  UserIcon,
  GraduationCapIcon 
} from 'lucide-react';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/profile/questions') return 'questions';
    if (path === '/profile/solutions') return 'solutions';
    if (path === '/profile/bookmarks') return 'bookmarks';
    return 'overview';
  };

  const activeTab = getActiveTab();
  
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

  // Fetch detailed contribution data
  const { 
    data: contributionData, 
    isLoading: contributionLoading, 
    error: contributionError 
  } = useContributionData();

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

  // User content hooks
  const { 
    data: userQuestionsData, 
    isLoading: questionsLoading, 
    isError: questionsError,
    error: questionsErrorObj
  } = useUserQuestions({ limit: 20, offset: 0 });

  const { 
    data: userSolutionsData, 
    isLoading: solutionsLoading, 
    isError: solutionsError,
    error: solutionsErrorObj
  } = useUserSolutions({ limit: 20, offset: 0 });

  const { 
    data: userBookmarksData, 
    isLoading: bookmarksLoading, 
    isError: bookmarksError,
    error: bookmarksErrorObj
  } = useUserBookmarks({ limit: 20, offset: 0 });

  // Loading state
  if (profileLoading || !profile || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  const TabButton = ({ to, icon: Icon, label, count, isActive }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
          isActive 
            ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' 
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </Link>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questions':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">My Questions</h2>
                </div>
                <Link
                  to="/feed"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Ask New Question
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                Questions you've asked to get help from the community
              </p>
            </div>
            <div className="p-6">
              <UserQuestionsList 
                questions={userQuestionsData?.posts || []}
                isLoading={questionsLoading}
                isError={questionsError}
                error={questionsErrorObj}
              />
            </div>
          </div>
        );

      case 'solutions':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileTextIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">My Solutions</h2>
                </div>
                <Link
                  to="/feed"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Find Questions to Answer
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                Solutions you've provided to help other students
              </p>
            </div>
            <div className="p-6">
              <UserSolutionsList 
                solutions={userSolutionsData?.solutions || []}
                isLoading={solutionsLoading}
                isError={solutionsError}
                error={solutionsErrorObj}
              />
            </div>
          </div>
        );

      case 'bookmarks':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookmarkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">My Bookmarks</h2>
                </div>
                <Link
                  to="/feed"
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Explore Content
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                Content you've saved for quick access later
              </p>
            </div>
            <div className="p-6">
              <UserBookmarksList 
                savedPosts={userBookmarksData?.savedPosts || []}
                bookmarkedSolutions={userBookmarksData?.bookmarkedSolutions || []}
                isLoading={bookmarksLoading}
                isError={bookmarksError}
                error={bookmarksErrorObj}
              />
            </div>
          </div>
        );

      default: // overview
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Academic Overview</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                Your learning activity and achievements at a glance
              </p>
            </div>
            
            {/* Quick Stats Cards */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/profile/questions"
                  className="bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4 transition-all duration-200 hover:shadow-sm hover:bg-blue-100/70 dark:hover:bg-blue-900/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                        <MessageCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-300 truncate">
                          Questions Asked
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Academic inquiries
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {userQuestionsData?.posts?.length || 0}
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/profile/solutions"
                  className="bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-4 transition-all duration-200 hover:shadow-sm hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                        <FileTextIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-300 truncate">
                          Solutions Provided
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Help contributions
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {userSolutionsData?.solutions?.length || 0}
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/profile/bookmarks"
                  className="bg-purple-50/70 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-lg p-4 transition-all duration-200 hover:shadow-sm hover:bg-purple-100/70 dark:hover:bg-purple-900/30 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                        <BookmarkIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-300 truncate">
                          Items Bookmarked
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Saved content
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {(userBookmarksData?.savedPosts?.length || 0) + (userBookmarksData?.bookmarkedSolutions?.length || 0)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 font-sans">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
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

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap gap-2">
                <TabButton
                  to="/profile"
                  icon={UserIcon}
                  label="Overview"
                  isActive={activeTab === 'overview'}
                />
                <TabButton
                  to="/profile/questions"
                  icon={MessageCircleIcon}
                  label="My Questions"
                  count={userQuestionsData?.posts?.length}
                  isActive={activeTab === 'questions'}
                />
                <TabButton
                  to="/profile/solutions"
                  icon={FileTextIcon}
                  label="My Solutions"
                  count={userSolutionsData?.solutions?.length}
                  isActive={activeTab === 'solutions'}
                />
                <TabButton
                  to="/profile/bookmarks"
                  icon={BookmarkIcon}
                  label="Bookmarks"
                  count={(userBookmarksData?.savedPosts?.length || 0) + (userBookmarksData?.bookmarkedSolutions?.length || 0)}
                  isActive={activeTab === 'bookmarks'}
                />
              </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Sidebar Column - spans 1 column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Contribution Stats with Tier Badge */}
            {contributionData ? (
              <ContributionStats 
                contributionData={contributionData} 
                userStats={stats}
              />
            ) : (
              <ProfileStats stats={stats} />
            )}
          </div>
        </div>

        {/* Course Management Section - Same width as main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center tracking-tight">
                  <GraduationCapIcon className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                  Course Management
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm font-medium">
                  Manage your course enrollments and academic progress
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <CourseEnrollmentSection 
                  enrollments={enrollments}
                  courses={courses}
                  departments={departments}
                  coursesLoading={coursesLoading}
                  enrollmentLoading={enrollmentLoading}
                  lastRefresh={lastRefresh}
                  showAddCourse={showAddCourse}
                  setShowAddCourse={setShowAddCourse}
                  selectedDepartment={selectedDepartment}
                  setSelectedDepartment={setSelectedDepartment}
                  enrollInCourse={enrollInCourse}
                  dropCourse={dropCourse}
                  getCoursesByDepartment={getCoursesByDepartment}
                  isEnrolledInCourse={isEnrolledInCourse}
                  refreshAll={refreshAll}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="bottom-right"
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