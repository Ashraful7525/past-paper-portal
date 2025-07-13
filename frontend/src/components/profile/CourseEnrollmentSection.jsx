import React from 'react';
import { GraduationCap, Plus, RefreshCw } from 'lucide-react';
import EnrolledCoursesList from './EnrolledCoursesList';
import AddCourseSection from './AddCourseSection';

const CourseEnrollmentSection = ({
  enrollments,
  lastRefresh,
  coursesLoading,
  refreshAll,
  showAddCourse,
  setShowAddCourse,
  enrollmentLoading,
  dropCourse,
  departments,
  selectedDepartment,
  setSelectedDepartment,
  courses,
  getCoursesByDepartment,
  isEnrolledInCourse,
  enrollInCourse
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
            Course Enrollments
          </h2>
          {lastRefresh && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={refreshAll}
          disabled={coursesLoading}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          title="Refresh enrollments"
        >
          <RefreshCw className={`h-4 w-4 ${coursesLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Current Enrollments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Enrolled Courses ({enrollments.length})
            </h3>
            <button
              onClick={() => setShowAddCourse(!showAddCourse)}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Course
            </button>
          </div>

          <div>
            <EnrolledCoursesList 
              enrollments={enrollments}
              coursesLoading={coursesLoading}
              enrollmentLoading={enrollmentLoading}
              dropCourse={dropCourse}
            />
          </div>

          {/* Add Course Section */}
          {showAddCourse && (
            <AddCourseSection 
              departments={departments}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              coursesLoading={coursesLoading}
              courses={courses}
              getCoursesByDepartment={getCoursesByDepartment}
              isEnrolledInCourse={isEnrolledInCourse}
              enrollInCourse={enrollInCourse}
              enrollmentLoading={enrollmentLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentSection;
