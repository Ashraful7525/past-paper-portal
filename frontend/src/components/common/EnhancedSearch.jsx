import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { api } from '../../utils/api';

const EnhancedSearch = ({ onSearch, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  
  const [filters, setFilters] = useState({
    course_id: initialFilters.course_id || '',
    level: initialFilters.level || '',
    term: initialFilters.term || '',
    year: initialFilters.year || '',
    question_no: initialFilters.question_no || '',
    search: initialFilters.search || ''
  });

  const courseDropdownRef = useRef(null);

  // Fetch courses and years on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, yearsResponse] = await Promise.all([
          api.get('/courses'),
          api.get('/posts/available-years')
        ]);
        
        setCourses(coursesResponse.data || []);
        setFilteredCourses(coursesResponse.data || []);
        setAvailableYears(yearsResponse.data || []);
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on search input
  useEffect(() => {
    if (courseSearch.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.course_code?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.course_title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.department_name?.toLowerCase().includes(courseSearch.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courseSearch, courses]);

  // Close course dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleCourseSearchChange = (value) => {
    setCourseSearch(value);
    // Don't trigger main search when typing in course search
    if (!showCourseDropdown) {
      setShowCourseDropdown(true);
    }
  };

  const handleCourseSelect = (course) => {
    setCourseSearch(`${course.course_code} - ${course.course_title}`);
    setShowCourseDropdown(false);
    handleFilterChange('course_id', course.course_id);
  };

  const clearFilters = () => {
    const clearedFilters = {
      course_id: '',
      level: '',
      term: '',
      year: '',
      question_no: '',
      search: ''
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    setCourseSearch('');
    onSearch(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const selectedCourse = courses.find(course => course.course_id === filters.course_id);

  return (
    <div className="w-full max-w-4xl mx-8">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-16 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${
            showFilters || getActiveFiltersCount() > 0
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Filter className="h-4 w-4" />
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Course Filter */}
            <div className="relative" ref={courseDropdownRef}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => handleCourseSearchChange(e.target.value)}
                  onClick={() => setShowCourseDropdown(true)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              {showCourseDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <button
                        key={course.course_id}
                        onClick={() => handleCourseSelect(course)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-gray-900 dark:text-white">
                          {course.course_code} - {course.course_title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {course.department_name}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No courses found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>

            {/* Term Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Term
              </label>
              <select
                value={filters.term}
                onChange={(e) => handleFilterChange('term', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Terms</option>
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Question Number Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question No.
              </label>
              <input
                type="number"
                placeholder="e.g., 1"
                value={filters.question_no}
                onChange={(e) => handleFilterChange('question_no', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {selectedCourse && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {selectedCourse.course_code}
                    <button
                      onClick={() => {
                        setCourseSearch('');
                        handleFilterChange('course_id', '');
                      }}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.level && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Level {filters.level}
                    <button
                      onClick={() => handleFilterChange('level', '')}
                      className="ml-1 hover:text-green-600 dark:hover:text-green-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.term && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Term {filters.term}
                    <button
                      onClick={() => handleFilterChange('term', '')}
                      className="ml-1 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.year && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Year {filters.year}
                    <button
                      onClick={() => handleFilterChange('year', '')}
                      className="ml-1 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.question_no && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Q. {filters.question_no}
                    <button
                      onClick={() => handleFilterChange('question_no', '')}
                      className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;