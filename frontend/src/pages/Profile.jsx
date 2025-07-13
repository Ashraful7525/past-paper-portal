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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <ProfileHeader 
              profile={profile}
              isAdmin={isAdmin}
              isEditing={isEditing}
              newProfileDescription={newProfileDescription}
              setNewProfileDescription={setNewProfileDescription}
              setIsEditing={setIsEditing}
              handleUpdateProfile={handleUpdateProfile}
            />

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

          {/* Sidebar with Stats */}
          <ProfileStats stats={stats} />
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)'
          }
        }}
      />
    </div>
  );
};

export default Profile;