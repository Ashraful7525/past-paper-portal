import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Award, Users, BookOpen, MessageCircle, Filter, ChevronDown, Star, Activity, ChevronLeft, ChevronRight, Upload, Flame, Clock, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { usePosts } from '../hooks/usePosts';
import { api } from '../utils/api';
import Header from '../components/common/Header';
import DarkModeToggle from '../components/common/DarkModeToggle';

// Left Sidebar Component
const LeftSidebar = ({ 
  sortBy, 
  onSortChange, 
  timeRange, 
  onTimeRangeChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const sortOptions = [
    { key: 'hot', label: 'Hot', icon: Flame, description: 'Trending posts' },
    { key: 'new', label: 'New', icon: Clock, description: 'Latest posts' },
    { key: 'top', label: 'Top', icon: TrendingUp, description: 'Most upvoted' }
  ];

  const timeOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ];

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-30"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        )}
        
        {/* Sort Options */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort by</h3>
          )}
          <div className="space-y-2">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => onSortChange(option.key)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === option.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={isCollapsed ? option.label : undefined}
                >
                  <Icon className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {!isCollapsed && (
                    <div className="text-left">
                      <div>{option.label}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors`}>
            <Upload className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && 'Upload Paper'}
          </button>
        </div>

        {/* Time Range */}
        {!isCollapsed && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Range</h3>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

const DepartmentSidebar = ({ departments, selectedDepartment, onDepartmentSelect, globalStats }) => {
  return (
    <div className="space-y-6">
      {/* Top Departments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Top Departments
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {departments.length} total
          </span>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => onDepartmentSelect(null)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
              !selectedDepartment 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🏠</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">All Departments</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View all posts
                  </div>
                </div>
              </div>
              {!selectedDepartment && (
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </button>
          
          {departments.map((dept) => (
            <button
              key={dept.department_id}
              onClick={() => onDepartmentSelect(dept.department_id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                selectedDepartment === dept.department_id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{dept.icon || '📚'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{dept.department_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dept.post_count?.toLocaleString() || 0} posts • {dept.solution_count?.toLocaleString() || 0} solutions
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {dept.trend_percentage && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      dept.trend_percentage > 0 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {dept.trend_percentage > 0 ? '+' : ''}{dept.trend_percentage}%
                    </div>
                  )}
                  {selectedDepartment === dept.department_id && (
                    <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Quick Stats
          </h3>
          <Activity className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Posts</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Questions & Papers</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {globalStats?.total_posts?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Active Users</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {globalStats?.active_users?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Solutions</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Answers provided</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {globalStats?.total_solutions?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Total Comments</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Discussions</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {globalStats?.total_comments?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Newsfeed = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  return (
    <>
      {/* Dark Mode Toggle - Fixed position in bottom-right */}
      <div className="fixed bottom-6 right-6 z-40">
        <DarkModeToggle />
      </div>
      
      {/* Custom Header with Search */}
      <Header searchQuery={searchQuery} onSearchChange={handleSearch} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex pt-16">
        {/* Left Sidebar */}
        <LeftSidebar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="w-full px-4 py-6">
            <div className="flex gap-6">
              {/* Posts Feed */}
              <div className="flex-1">
                {isError && postsError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200 text-sm">{postsError.message || 'Failed to load posts'}</p>
                  </div>
                )}

                {/* Posts */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.post_id} post={post} />
                  ))}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  </div>
                )}

                {/* Load more button */}
                {!isLoading && hasNextPage && posts.length > 0 && (
                  <div className="flex justify-center py-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={isFetchingNextPage}
                      className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Posts'}
                    </button>
                  </div>
                )}

                {/* No posts message */}
                {!isLoading && posts.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share a paper!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Departments */}
              <div className="w-80">
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
    </>
  );
};

export default Newsfeed;