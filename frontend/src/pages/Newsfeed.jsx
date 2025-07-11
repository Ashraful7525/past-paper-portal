import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Award, Users, BookOpen, MessageCircle, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { api } from '../utils/api';

const DepartmentSidebar = ({ departments, selectedDepartment, onDepartmentSelect, globalStats }) => {
  return (
    <div className="space-y-4">
      {/* Top Departments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Top Departments
          </h3>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => onDepartmentSelect(null)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              !selectedDepartment ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏠</span>
                <span className="font-medium text-gray-900 dark:text-white">All Departments</span>
              </div>
            </div>
          </button>
          
          {departments.map((dept) => (
            <button
              key={dept.department_id}
              onClick={() => onDepartmentSelect(dept.department_id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedDepartment === dept.department_id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{dept.icon}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{dept.department_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dept.post_count} posts • {dept.solution_count} solutions
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {dept.trend}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Award className="h-4 w-4 mr-2" />
          Quick Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Total Posts</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{globalStats?.total_posts?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active Users</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{globalStats?.active_users?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Total Solutions</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{globalStats?.total_solutions?.toLocaleString() || 0}</span>
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
  const [posts, setPosts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from API
  const fetchPosts = async (page = 1, reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        time: timeRange,
      });

      if (selectedDepartment) {
        params.append('department', selectedDepartment.toString());
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/posts/feed?${params.toString()}`);
      
      if (reset) {
        setPosts(response.data.posts || []);
        // Update departments and global stats from API response
        if (response.data.departments) {
          setDepartments(response.data.departments);
        }
        if (response.data.globalStats) {
          setGlobalStats(response.data.globalStats);
        }
      } else {
        setPosts(prev => [...prev, ...(response.data.posts || [])]);
      }
      
      setHasMore(response.data.pagination?.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchPosts(1, true);
  }, [searchQuery, sortBy, timeRange, selectedDepartment]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts(currentPage + 1, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 w-full">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsfeed</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="input-field pl-10"
                />
              </div>
              <button className="btn-primary">
                Upload Paper
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                {['hot', 'new', 'top'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => handleSortChange(sort)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === sort 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Time Range */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="day">Past Day</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <button 
                  onClick={() => fetchPosts(1, true)}
                  className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {isLoading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchQuery ? 'Try adjusting your search terms' : 'Try selecting a different department or time range'}
                </p>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <PostCard 
                    key={post.post_id} 
                    post={post} 
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`lg:col-span-1 order-1 lg:order-2 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
  );
};

export default Newsfeed;