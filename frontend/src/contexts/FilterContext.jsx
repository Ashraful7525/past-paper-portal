import React, { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  // Filter state
  const [filters, setFilters] = useState({
    // Sidebar filters
    sortBy: 'hot',
    timeRange: 'all',
    
    // Department filter
    selectedDepartment: null,
    
    // For you filter
    forYou: false,
    
    // Search filters
    searchFilters: {
      course_id: '',
      level: '',
      term: '',
      year: '',
      question_no: '',
      search: ''
    },
    
    // Sidebar collapse state
    isSidebarCollapsed: false
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('feedFilters', JSON.stringify(filters));
  }, [filters]);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('feedFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  }, []);

  // Update specific filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update search filters
  const updateSearchFilters = (newSearchFilters) => {
    setFilters(prev => ({
      ...prev,
      searchFilters: {
        ...prev.searchFilters,
        ...newSearchFilters
      }
    }));
  };

  // Reset all filters to default
  const resetFilters = () => {
    const defaultFilters = {
      sortBy: 'hot',
      timeRange: 'all',
      selectedDepartment: null,
      forYou: false,
      searchFilters: {
        course_id: '',
        level: '',
        term: '',
        year: '',
        question_no: '',
        search: ''
      },
      isSidebarCollapsed: false
    };
    setFilters(defaultFilters);
  };

  // Get all filters as a single object for API calls
  const getAllFilters = () => ({
    sortBy: filters.sortBy,
    timeRange: filters.timeRange,
    department_id: filters.selectedDepartment,
    forYou: filters.forYou,
    ...filters.searchFilters
  });

  const value = {
    filters,
    updateFilter,
    updateSearchFilters,
    resetFilters,
    getAllFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}; 