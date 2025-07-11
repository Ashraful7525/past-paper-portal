import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Award, Users, BookOpen, MessageCircle, ArrowUp, ArrowDown, Bookmark, Eye, Download, Star, Filter, ChevronDown } from 'lucide-react';

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3000/api';

// API service functions
const apiService = {
  async getFeedPosts(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/posts/feed?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  },

  async votePost(postId, voteType) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
      },
      body: JSON.stringify({ vote_type: voteType })
    });
    if (!response.ok) {
      throw new Error('Failed to vote');
    }
    return response.json();
  },

  async toggleSavePost(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
      }
    });
    if (!response.ok) {
      throw new Error('Failed to save post');
    }
    return response.json();
  },

  async trackView(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to track view');
    }
    return response.json();
  }
};

const PostCard = ({ post, onVote, onSave, onView }) => {
  const [userVote, setUserVote] = useState(post.user_vote || 0);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleVote = async (voteType) => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const newVote = userVote === voteType ? 0 : voteType;
      
      // Optimistic update
      if (userVote === 1 && newVote === 0) {
        setUpvotes(prev => prev - 1);
      } else if (userVote === -1 && newVote === 0) {
        setDownvotes(prev => prev - 1);
      } else if (userVote === 0 && newVote === 1) {
        setUpvotes(prev => prev + 1);
      } else if (userVote === 0 && newVote === -1) {
        setDownvotes(prev => prev + 1);
      } else if (userVote === 1 && newVote === -1) {
        setUpvotes(prev => prev - 1);
        setDownvotes(prev => prev + 1);
      } else if (userVote === -1 && newVote === 1) {
        setDownvotes(prev => prev - 1);
        setUpvotes(prev => prev + 1);
      }
      
      setUserVote(newVote);
      
      // API call
      await apiService.votePost(post.post_id, newVote);
      onVote && onVote(post.post_id, newVote);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setUserVote(post.user_vote || 0);
      setUpvotes(post.upvotes || 0);
      setDownvotes(post.downvotes || 0);
    } finally {
      setIsVoting(false);
    }
  };

  const toggleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Optimistic update
      setIsSaved(!isSaved);
      
      // API call
      await apiService.toggleSavePost(post.post_id);
      onSave && onSave(post.post_id, !isSaved);
    } catch (error) {
      console.error('Error saving:', error);
      // Revert optimistic update on error
      setIsSaved(post.is_saved || false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleView = async () => {
    try {
      await apiService.trackView(post.post_id);
      onView && onView(post.post_id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{post.department_icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{post.department_name}</span>
                {post.is_verified && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {post.is_featured && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {post.course_title} • {post.semester_name}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatTimeAgo(post.created_at)}
          </div>
        </div>
        
        {/* Title and Preview */}
        <h2 
          className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
          onClick={handleView}
        >
          {post.title}
        </h2>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {post.preview_text}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Vote Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === 1 ? 'text-orange-600 bg-orange-100' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
              {upvotes - downvotes}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === -1 ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          
          {/* Comments */}
          <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comment_count || 0}</span>
          </div>
          
          {/* Views */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{(post.view_count || 0).toLocaleString()}</span>
          </div>
          
          {/* Downloads */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span className="text-sm">{post.download_count || 0}</span>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={toggleSave}
          disabled={isSaving}
          className={`p-2 rounded transition-colors ${
            isSaved ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const DepartmentSidebar = ({ departments, selectedDepartment, onDepartmentSelect, globalStats }) => {
  return (
    <div className="space-y-4">
      {/* Top Departments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Top Departments
          </h3>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => onDepartmentSelect(null)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              !selectedDepartment ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏠</span>
                <span className="font-medium">All Departments</span>
              </div>
            </div>
          </button>
          
          {departments.map((dept) => (
            <button
              key={dept.department_id}
              onClick={() => onDepartmentSelect(dept.department_id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedDepartment === dept.department_id ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{dept.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{dept.department_name}</div>
                    <div className="text-xs text-gray-500">
                      {dept.post_count} posts • {dept.solution_count} solutions
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {dept.trend}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-4 w-4 mr-2" />
          Quick Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Total Posts</span>
            </div>
            <span className="font-medium">{globalStats?.total_posts?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm">Active Users</span>
            </div>
            <span className="font-medium">{globalStats?.active_users?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Total Solutions</span>
            </div>
            <span className="font-medium">{globalStats?.total_solutions?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Newsfeed = () => {
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
      const params = {
        page,
        limit: 20,
        sort: sortBy,
        time: timeRange,
        department: selectedDepartment,
        search: searchQuery || undefined
      };

      const response = await apiService.getFeedPosts(params);
      
      if (reset) {
        setPosts(response.posts || []);
        // Update departments and global stats from API response
        if (response.departments) {
          setDepartments(response.departments);
        }
        if (response.globalStats) {
          setGlobalStats(response.globalStats);
        }
      } else {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      }
      
      setHasMore(response.pagination?.hasMore || false);
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

  const handlePostVote = (postId, newVote) => {
    // Update local state if needed
    setPosts(prev => prev.map(post => 
      post.post_id === postId 
        ? { ...post, user_vote: newVote }
        : post
    ));
  };

  const handlePostSave = (postId, isSaved) => {
    // Update local state if needed
    setPosts(prev => prev.map(post => 
      post.post_id === postId 
        ? { ...post, is_saved: isSaved }
        : post
    ));
  };

  const handlePostView = (postId) => {
    // Update view count in local state
    setPosts(prev => prev.map(post => 
      post.post_id === postId 
        ? { ...post, view_count: (post.view_count || 0) + 1 }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">📚 StudyHub</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Paper
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search past papers, solutions, or topics..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sort === 'hot' && <TrendingUp className="h-4 w-4 mr-1 inline" />}
                    {sort === 'new' && <Clock className="h-4 w-4 mr-1 inline" />}
                    {sort === 'top' && <Award className="h-4 w-4 mr-1 inline" />}
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Time Range */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="day">Past Day</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 text-gray-600 hover:text-gray-900"
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => fetchPosts(1, true)}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {isLoading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms' : 'Try selecting a different department or time range'}
                </p>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <PostCard 
                    key={post.post_id} 
                    post={post} 
                    onVote={handlePostVote}
                    onSave={handlePostSave}
                    onView={handlePostView}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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