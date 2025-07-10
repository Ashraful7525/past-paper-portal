import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Award, Users, BookOpen, MessageCircle, ArrowUp, ArrowDown, Bookmark, Eye, Download, Star, Filter, ChevronDown } from 'lucide-react';

// Mock data for demonstration - replace with real API calls
const mockPosts = [
  {
    post_id: 1,
    title: "CSE 101 Final Exam 2023 - Data Structures and Algorithms",
    preview_text: "Complete solution set for CSE 101 final exam including all programming problems and theoretical questions. Covers arrays, linked lists, trees, graphs, and dynamic programming concepts.",
    author_username: "john_doe",
    department_name: "Computer Science",
    department_icon: "💻",
    course_title: "Data Structures & Algorithms",
    semester_name: "Fall 2023",
    upvotes: 145,
    downvotes: 3,
    view_count: 2850,
    download_count: 189,
    comment_count: 23,
    user_vote: 1,
    is_saved: false,
    tags: ["algorithms", "final-exam", "programming", "data-structures"],
    created_at: "2024-01-15T10:30:00Z",
    file_url: "/uploads/cse101-final-2023.pdf",
    is_verified: true,
    is_featured: false
  },
  {
    post_id: 2,
    title: "Mathematics 201 - Linear Algebra Mid-term Solutions",
    preview_text: "Step-by-step solutions for all matrix operations, eigenvalues, and vector space problems. Includes detailed explanations and alternative solution methods.",
    author_username: "math_wizard",
    department_name: "Mathematics",
    department_icon: "📐",
    course_title: "Linear Algebra",
    semester_name: "Spring 2023",
    upvotes: 89,
    downvotes: 2,
    view_count: 1450,
    download_count: 97,
    comment_count: 15,
    user_vote: 0,
    is_saved: true,
    tags: ["linear-algebra", "matrices", "mid-term", "mathematics"],
    created_at: "2024-01-14T14:20:00Z",
    file_url: "/uploads/math201-midterm.pdf",
    is_verified: true,
    is_featured: true
  },
  {
    post_id: 3,
    title: "Physics 301 - Quantum Mechanics Problem Set",
    preview_text: "Comprehensive solutions for quantum mechanics problems covering wave functions, operators, and measurements. Perfect for exam preparation.",
    author_username: "physics_pro",
    department_name: "Physics",
    department_icon: "⚛️",
    course_title: "Quantum Mechanics",
    semester_name: "Fall 2023",
    upvotes: 67,
    downvotes: 4,
    view_count: 1120,
    download_count: 43,
    comment_count: 12,
    user_vote: -1,
    is_saved: false,
    tags: ["quantum-mechanics", "problem-set", "physics", "advanced"],
    created_at: "2024-01-13T09:15:00Z",
    file_url: "/uploads/physics301-problems.pdf",
    is_verified: false,
    is_featured: false
  }
];

const mockDepartments = [
  { 
    department_id: 1, 
    department_name: "Computer Science", 
    icon: "💻", 
    post_count: 234, 
    question_count: 456,
    solution_count: 1890,
    trend: "+12%"
  },
  { 
    department_id: 2, 
    department_name: "Mathematics", 
    icon: "📐", 
    post_count: 189, 
    question_count: 367,
    solution_count: 1456,
    trend: "+8%"
  },
  { 
    department_id: 3, 
    department_name: "Physics", 
    icon: "⚛️", 
    post_count: 156, 
    question_count: 289,
    solution_count: 1123,
    trend: "+5%"
  },
  { 
    department_id: 4, 
    department_name: "Chemistry", 
    icon: "🧪", 
    post_count: 134, 
    question_count: 234,
    solution_count: 987,
    trend: "+3%"
  },
  { 
    department_id: 5, 
    department_name: "Biology", 
    icon: "🧬", 
    post_count: 98, 
    question_count: 178,
    solution_count: 743,
    trend: "+7%"
  }
];

const PostCard = ({ post }) => {
  const [userVote, setUserVote] = useState(post.user_vote);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);

  const handleVote = (voteType) => {
    const newVote = userVote === voteType ? 0 : voteType;
    
    // Update vote counts
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
    // TODO: API call to update vote
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // TODO: API call to toggle save
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
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
              className={`p-1 rounded transition-colors ${
                userVote === 1 ? 'text-orange-600 bg-orange-100' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
              {upvotes - downvotes}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={`p-1 rounded transition-colors ${
                userVote === -1 ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          
          {/* Comments */}
          <div className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comment_count}</span>
          </div>
          
          {/* Views */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{post.view_count.toLocaleString()}</span>
          </div>
          
          {/* Downloads */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span className="text-sm">{post.download_count}</span>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={toggleSave}
          className={`p-2 rounded transition-colors ${
            isSaved ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const DepartmentSidebar = ({ departments, selectedDepartment, onDepartmentSelect }) => {
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
            <span className="font-medium">1,247</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm">Active Users</span>
            </div>
            <span className="font-medium">456</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Solutions</span>
            </div>
            <span className="font-medium">3,891</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [posts, setPosts] = useState(mockPosts);
  const [departments, setDepartments] = useState(mockDepartments);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Simulate API calls
  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchPosts = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredPosts = mockPosts;
      
      // Apply filters
      if (selectedDepartment) {
        filteredPosts = filteredPosts.filter(post => 
          post.department_name === departments.find(d => d.department_id === selectedDepartment)?.department_name
        );
      }
      
      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.preview_text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredPosts.sort((a, b) => {
        switch (sortBy) {
          case 'hot':
            return (b.upvotes - b.downvotes + b.view_count * 0.1) - (a.upvotes - a.downvotes + a.view_count * 0.1);
          case 'new':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'top':
            return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
          default:
            return 0;
        }
      });
      
      setPosts(filteredPosts);
      setIsLoading(false);
    };

    fetchPosts();
  }, [searchQuery, sortBy, timeRange, selectedDepartment, departments]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
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
            {isLoading ? (
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
                  <PostCard key={post.post_id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`lg:col-span-1 order-1 lg:order-2 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <DepartmentSidebar 
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={setSelectedDepartment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;