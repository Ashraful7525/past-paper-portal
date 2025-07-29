import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import { usePosts } from '../hooks/usePosts';
import { useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import Header from '../components/common/Header';
import DarkModeToggle from '../components/common/DarkModeToggle';
import UploadPaperModal from '../components/UploadPaperModal';
import LeftSidebar from '../components/newsfeed/LeftSidebar';
import DepartmentSidebar from '../components/newsfeed/DepartmentSidebar';
import PostsList from '../components/newsfeed/PostsList';

const Newsfeed = () => {
  const { user } = useAuth();
  const { filters, updateFilter, updateSearchFilters } = useFilters();
  const location = useLocation();
  const hasRestoredFilters = useRef(false);
  const [departments, setDepartments] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Use React Query for posts data with memoized filters
  const apiFilters = useMemo(() => ({
    sortBy: filters.sortBy,
    timeRange: filters.timeRange,
    department_id: filters.selectedDepartment,
    forYou: filters.forYou,
    ...filters.searchFilters
  }), [filters]);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: postsError
  } = usePosts(apiFilters);

  // Flatten posts from all pages
  const posts = postsData?.pages?.flatMap(page => page.data?.posts || []) || [];

  // Handle preserved filter state when navigating back
  useEffect(() => {
    if (
      !hasRestoredFilters.current &&
      location.state?.preserveFilters &&
      location.state?.filters
    ) {
      const preservedFilters = location.state.filters;
      Object.entries(preservedFilters).forEach(([key, value]) => {
        if (key === 'searchFilters') {
          updateSearchFilters(value);
        } else {
          updateFilter(key, value);
        }
      });
      hasRestoredFilters.current = true;
    }
  }, [location.state, updateFilter, updateSearchFilters]);

  // Fetch departments and stats on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentsResponse, statsResponse] = await Promise.all([
          api.get('/posts/departments'),
          api.get('/posts/stats')
        ]);
        
        setDepartments(departmentsResponse.data || []);
        setGlobalStats(statsResponse.data || {});
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearchChange = (newFilters) => {
    updateSearchFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    updateFilter('sortBy', newSort);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    updateFilter('timeRange', newTimeRange);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleToggleSidebar = () => {
    updateFilter('isSidebarCollapsed', !filters.isSidebarCollapsed);
  };

  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  return (
    <>
      {/* Dark Mode Toggle - Fixed position in bottom-right */}
      <div className="fixed bottom-6 right-6 z-40">
        <DarkModeToggle />
      </div>
      
      {/* Enhanced Header with Search */}
      <Header 
        searchFilters={filters.searchFilters}
        onSearchChange={handleSearchChange}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar */}
        <LeftSidebar
          sortBy={filters.sortBy}
          onSortChange={handleSortChange}
          timeRange={filters.timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          isCollapsed={filters.isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onShowUploadModal={handleShowUploadModal}
          forYou={filters.forYou}
          onForYouChange={(value) => updateFilter('forYou', value)}
        />

        {/* Main Content */}
        <div className={`transition-all duration-300 ${filters.isSidebarCollapsed ? 'ml-16' : 'ml-64'} pt-16`}>
          <div className="px-4 py-8">
            <div className="flex gap-6 justify-center">
              {/* Posts Feed */}
              <div className="flex-1 max-w-4xl">
                <PostsList
                  posts={posts}
                  isLoading={isLoading}
                  isError={isError}
                  error={postsError}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onLoadMore={handleLoadMore}
                  searchFilters={filters.searchFilters}
                />
              </div>

              {/* Right Sidebar - Departments */}
              <div className="w-80 flex-shrink-0">
                <DepartmentSidebar
                  departments={departments}
                  selectedDepartment={filters.selectedDepartment}
                  onDepartmentSelect={(dept) => updateFilter('selectedDepartment', dept)}
                  globalStats={globalStats}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Paper Modal */}
      <UploadPaperModal 
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
      />
    </>
  );
};

export default Newsfeed;