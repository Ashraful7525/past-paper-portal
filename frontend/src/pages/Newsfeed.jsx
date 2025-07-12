import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { api } from '../utils/api';
import Header from '../components/common/Header';
import DarkModeToggle from '../components/common/DarkModeToggle';
import UploadPaperModal from '../components/UploadPaperModal';
import LeftSidebar from '../components/newsfeed/LeftSidebar';
import DepartmentSidebar from '../components/newsfeed/DepartmentSidebar';
import PostsList from '../components/newsfeed/PostsList';

const Newsfeed = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Use React Query for posts data with memoized filters
  const filters = useMemo(() => ({
    sortBy,
    timeRange,
    department_id: selectedDepartment,
    search: searchQuery
  }), [sortBy, timeRange, selectedDepartment, searchQuery]);

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: postsError
  } = usePosts(filters);

  // Flatten posts from all pages
  const posts = postsData?.pages?.flatMap(page => page.data?.posts || []) || [];

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      
      {/* Custom Header with Search */}
      <Header searchQuery={searchQuery} onSearchChange={handleSearch} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar */}
        <LeftSidebar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onShowUploadModal={handleShowUploadModal}
        />

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pt-16`}>
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
                  searchQuery={searchQuery}
                />
              </div>

              {/* Right Sidebar - Departments */}
              <div className="w-80 flex-shrink-0">
                <DepartmentSidebar
                  departments={departments}
                  selectedDepartment={selectedDepartment}
                  onDepartmentSelect={setSelectedDepartment}
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