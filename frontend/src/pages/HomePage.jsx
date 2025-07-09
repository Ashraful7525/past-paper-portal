import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import InfiniteScroll from 'react-infinite-scroll-component';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = usePosts({
    sort: sortBy,
    search: searchQuery || undefined,
    department: selectedDepartment
  });

  const posts = data?.pages?.flatMap(page => page.posts) || [];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Failed to load posts. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Past Paper Portal</h1>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search past papers..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Popular Departments</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    !selectedDepartment ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  All Departments
                </button>
                {/* Add more department buttons here */}
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
                endMessage={
                  <div className="text-center py-8 text-gray-500">
                    <p>You've reached the end! 🎉</p>
                  </div>
                }
              >
                {posts.map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
