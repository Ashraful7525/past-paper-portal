import React from 'react';

const AddCourseSection = ({ 
  departments,
  selectedDepartment,
  setSelectedDepartment,
  coursesLoading,
  courses,
  getCoursesByDepartment,
  isEnrolledInCourse,
  enrollInCourse,
  enrollmentLoading
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Course</h3>
      
      {/* Department Filter */}
      <div className="mb-4">
        <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Department
        </label>
        <select
          id="department-filter"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Departments</option>
          {departments
            .sort((a, b) => a.department_name.localeCompare(b.department_name))
            .map((dept) => (
            <option key={dept.department_id} value={dept.department_id}>
              {dept.icon} {dept.department_name}
            </option>
          ))}
        </select>
      </div>

      {/* Available Courses */}
      <div className="max-h-64 overflow-y-auto">
        {coursesLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {(selectedDepartment ? getCoursesByDepartment(parseInt(selectedDepartment)) : courses)
              .filter(course => !isEnrolledInCourse(course.course_id))
              .map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{course.department_icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.course_code ? `${course.course_code} - ` : ''}{course.course_title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.department_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => enrollInCourse(course.course_id)}
                    disabled={enrollmentLoading}
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              ))}
            {(selectedDepartment ? getCoursesByDepartment(parseInt(selectedDepartment)) : courses)
              .filter(course => !isEnrolledInCourse(course.course_id)).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {selectedDepartment ? 'No available courses in this department' : 'No available courses to enroll in'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourseSection;
