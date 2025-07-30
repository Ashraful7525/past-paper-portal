import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../hooks/useCourses';
import CourseEnrollmentSection from '../components/profile/CourseEnrollmentSection';
import { 
  GraduationCapIcon,
  ArrowLeftIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CoursesPage = () => {
  const { user } = useAuth();
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/profile"
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight flex items-center">
                <GraduationCapIcon className="w-8 h-8 mr-4" />
                Course Management
              </h1>
              <p className="text-base text-blue-100 dark:text-blue-200 font-medium max-w-2xl">
                Manage your course enrollments and track your academic progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Management Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
            <div className="p-8">
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

          {/* Additional Course Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <GraduationCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrollments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Courses</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrollments?.filter(e => e.is_currently_enrolled)?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Currently Enrolled</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {departments?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Departments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;