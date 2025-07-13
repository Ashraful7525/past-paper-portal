import React from 'react';
import { X } from 'lucide-react';

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
                  <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No courses enrolled yet. Add some courses to get started!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.enrollment_id}
          className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 ${
            enrollment.enrollment_id.toString().startsWith('temp-') 
              ? 'opacity-70 ring-2 ring-blue-200 dark:ring-blue-800' 
              : ''
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{enrollment.department_icon}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {enrollment.course_code ? `${enrollment.course_code} - ` : ''}{enrollment.course_title}
                  {enrollment.enrollment_id.toString().startsWith('temp-') && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(enrolling...)</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {enrollment.department_name}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => dropCourse(enrollment.enrollment_id)}
            disabled={enrollmentLoading || enrollment.enrollment_id.toString().startsWith('temp-')}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Drop Course"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EnrolledCoursesList;
