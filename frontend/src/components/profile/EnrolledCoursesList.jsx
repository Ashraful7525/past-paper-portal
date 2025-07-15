import React from 'react';
import { X, Users, Calendar } from 'lucide-react';

const EnrolledCoursesList = ({ 
  enrollments, 
  coursesLoading, 
  enrollmentLoading, 
  dropCourse 
}) => {
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        {coursesLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No courses enrolled yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add some courses to get started with your learning journey!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.enrollment_id}
          className={`relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-all duration-200 ${
            enrollment.enrollment_id.toString().startsWith('temp-') 
              ? 'opacity-70 ring-2 ring-blue-200 dark:ring-blue-800' 
              : ''
          }`}
        >
          {/* Course Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{enrollment.department_icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                  {enrollment.course_code ? `${enrollment.course_code}` : 'Course'}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate">
                  {enrollment.course_title}
                </p>
              </div>
            </div>
            
            {/* Enrollment Status Badge - Only show for temp enrollments */}
            {enrollment.enrollment_id.toString().startsWith('temp-') && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Enrolling...
                </span>
              </div>
            )}
          </div>

          {/* Department Info */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {enrollment.department_name}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {enrollment.enrollment_id.toString().startsWith('temp-') ? (
                'Processing enrollment...'
              ) : (
                'Active enrollment'
              )}
            </div>
            
            <button
              onClick={() => dropCourse(enrollment.enrollment_id)}
              disabled={enrollmentLoading || enrollment.enrollment_id.toString().startsWith('temp-')}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Unenroll from course"
            >
              <X className="h-4 w-4 mr-1" />
              Unenroll
            </button>
          </div>

          {/* Loading Overlay for temp enrollments */}
          {enrollment.enrollment_id.toString().startsWith('temp-') && (
            <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Processing...</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EnrolledCoursesList;
