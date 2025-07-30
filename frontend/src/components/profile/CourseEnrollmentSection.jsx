import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, RefreshCw, Search, X } from 'lucide-react';
import EnrolledCoursesList from './EnrolledCoursesList';

const CourseEnrollmentSection = ({
  enrollments,
  lastRefresh,
  coursesLoading,
  refreshAll,
  showAddCourse,
  setShowAddCourse,
  enrollmentLoading,
  dropCourse,
  courses,
  isEnrolledInCourse,
  enrollInCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = courses.filter(course => {
      const searchLower = searchTerm.toLowerCase();
      const courseCode = course.course_code?.toLowerCase() || '';
      const courseTitle = course.course_title?.toLowerCase() || '';
      const departmentName = course.department_name?.toLowerCase() || '';
      
      return (
        courseCode.includes(searchLower) ||
        courseTitle.includes(searchLower) ||
        departmentName.includes(searchLower)
      );
    }).slice(0, 10); // Limit to 10 suggestions

    setFilteredCourses(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchTerm, courses]);

  const handleSearchFocus = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleCourseSelect = (course) => {
    if (!isEnrolledInCourse(course.course_id)) {
      enrollInCourse(course.course_id);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const toggleAddCourse = () => {
    setShowAddCourse(!showAddCourse);
    if (!showAddCourse) {
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Enrolled Courses ({enrollments.length})
            </h3>
          </div>
          {lastRefresh && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Updated: {new Date(lastRefresh).toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshAll}
            disabled={coursesLoading}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh enrollments"
          >
            <RefreshCw className={`h-5 w-5 ${coursesLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={toggleAddCourse}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <EnrolledCoursesList 
          enrollments={enrollments}
          coursesLoading={coursesLoading}
          enrollmentLoading={enrollmentLoading}
          dropCourse={dropCourse}
        />
      </div>

      {/* Add Course Section */}
      {showAddCourse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-visible relative">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Course
                </h3>
              </div>
              <button
                onClick={toggleAddCourse}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 relative">
            {/* Search Bar */}
            <div className="relative mb-6 z-[1]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search for courses
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by course code, title, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              {/* Course Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {filteredCourses.length > 0 ? (
                    <div className="py-2">
                      {filteredCourses.map((course) => (
                        <div
                          key={course.course_id}
                          onClick={() => handleCourseSelect(course)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {course.department_icon || course.course_code?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">
                                {course.course_code && `${course.course_code} - `}{course.course_title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {course.department_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isEnrolledInCourse(course.course_id) ? (
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded-full">
                                Enrolled
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCourseSelect(course);
                                }}
                                disabled={enrollmentLoading}
                                className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                Enroll
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No courses found matching "{searchTerm}"</p>
                      <p className="text-xs mt-1">Try different keywords or check spelling</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Finding the right course
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Use the search bar to find courses by code (e.g., "CSE101"), title, or department name. 
                    Click on a course to enroll instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEnrollmentSection;
