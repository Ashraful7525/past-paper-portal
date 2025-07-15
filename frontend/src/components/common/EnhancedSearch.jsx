import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../utils/api';

const EnhancedSearch = ({ onSearch, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
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

  const dropdownRef = useRef(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFiltersDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowFiltersDropdown(false);
      }
    };

    if (showFiltersDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFiltersDropdown]);

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
    <div className="w-full max-w-3xl relative" ref={dropdownRef}>
      {/* Search Bar - Significantly Widened */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
        />
        <button
          onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
            getActiveFiltersCount() > 0 || showFiltersDropdown
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {showFiltersDropdown ? <ChevronUp className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filters Dropdown - Compact Layout */}
      {showFiltersDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
          <div className="p-4">
            {/* Compact Filter Grid */}
            <div className="flex gap-2 mb-4">
              {/* Course Filter */}
              <div className="relative flex-1" ref={courseDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select Course"
                    value={courseSearch}
                    onChange={(e) => handleCourseSearchChange(e.target.value)}
                    onClick={() => setShowCourseDropdown(true)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
                
                {showCourseDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <button
                          key={course.course_id}
                          onClick={() => handleCourseSelect(course)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <div className="text-gray-900 dark:text-white font-medium">
                            {course.course_code} - {course.course_title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {course.department_name}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No courses found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Level Filter */}
              <div className="w-24">
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                >
                  <option value="">Level</option>
                  <option value="1">L1</option>
                  <option value="2">L2</option>
                  <option value="3">L3</option>
                  <option value="4">L4</option>
                </select>
              </div>

              {/* Term Filter */}
              <div className="w-20">
                <select
                  value={filters.term}
                  onChange={(e) => handleFilterChange('term', e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                >
                  <option value="">Term</option>
                  <option value="1">T1</option>
                  <option value="2">T2</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="w-20">
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                >
                  <option value="">Year</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Question Number Filter */}
              <div className="w-16">
                <input
                  type="number"
                  placeholder="Q#"
                  value={filters.question_no}
                  onChange={(e) => handleFilterChange('question_no', e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                  min="1"
                />
              </div>
            </div>

            {/* Active Filters and Actions */}
            {getActiveFiltersCount() > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedCourse && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {selectedCourse.course_code}
                      <button
                        onClick={() => {
                          setCourseSearch('');
                          handleFilterChange('course_id', '');
                        }}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.level && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      L{filters.level}
                      <button
                        onClick={() => handleFilterChange('level', '')}
                        className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.term && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      T{filters.term}
                      <button
                        onClick={() => handleFilterChange('term', '')}
                        className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.year && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      {filters.year}
                      <button
                        onClick={() => handleFilterChange('year', '')}
                        className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.question_no && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Q{filters.question_no}
                      <button
                        onClick={() => handleFilterChange('question_no', '')}
                        className="ml-1 hover:text-red-900 dark:hover:text-red-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getActiveFiltersCount()} active
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;