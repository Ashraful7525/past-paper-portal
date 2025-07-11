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
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const cardRef = React.useRef(null);

  useEffect(() => {
    if (!cardRef.current || hasBeenViewed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenViewed(true);
          apiService.trackView(post.post_id)
            .then(() => {
              onView && onView(post.post_id);
            })
            .catch(error => {
              console.error('Error tracking view:', error);
              setHasBeenViewed(false); // Allow retry on error
            });
          observer.disconnect();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [post.post_id, hasBeenViewed, onView]);

  const handleVote = async (voteType) => {
    if (isVoting) return;

    const originalUserVote = userVote;
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;

    setIsVoting(true);
    try {
      const newVote = userVote === voteType ? 0 : voteType;
      
      // Optimistic update for the button state
      setUserVote(newVote);
      
      // API call
      const result = await apiService.votePost(post.post_id, newVote);
      
      // Update counts from the server's response
      if (result.data) {
        setUpvotes(result.data.upvotes);
        setDownvotes(result.data.downvotes);
        onVote && onVote(post.post_id, newVote, result.data.upvotes, result.data.downvotes);
      } else {
        // Fallback if data object is not in response
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setUserVote(originalUserVote);
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
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
    <div ref={cardRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{post.department_icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">{post.department_name}</span>
                {post.is_verified && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {post.is_featured && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {post.course_title} • {post.semester_name}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimeAgo(post.created_at)}
          </div>
        </div>
        
        {/* Title and Preview */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {post.preview_text}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Vote Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === 1 ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
              {upvotes - downvotes}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                userVote === -1 ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          
          {/* Comments */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comment_count || 0}</span>
          </div>
          
          {/* Views */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{(post.view_count || 0).toLocaleString()}</span>
          </div>
          
          {/* Downloads */}
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Download className="h-4 w-4" />
            <span className="text-sm">{post.download_count || 0}</span>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={toggleSave}
          disabled={isSaving}
          className={`p-2 rounded transition-colors ${
            isSaved ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
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
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

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

  const handlePostVote = (postId, newVote, upvotes, downvotes) => {
    setPosts(prev => prev.map(post => 
      post.post_id === postId 
        ? { ...post, user_vote: newVote, upvotes, downvotes }
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