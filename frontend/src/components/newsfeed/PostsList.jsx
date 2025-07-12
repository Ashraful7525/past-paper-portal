import React from 'react';
import { BookOpen } from 'lucide-react';
import PostCard from '../PostCard';

const PostsList = ({ 
  posts, 
  isLoading, 
  isError, 
  error, 
  hasNextPage, 
  isFetchingNextPage, 
  onLoadMore, 
  searchQuery 
}) => {
  if (isError && error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400">⚠️</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Posts</h3>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error.message || 'Failed to load posts'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No posts found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `No posts match your search for "${searchQuery}". Try adjusting your search terms or filters.`
            : 'Be the first to share a paper or ask a question in this community!'
          }
        </p>
        {!searchQuery && (
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Upload Paper
            </button>
            <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
              Browse All Posts
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Posts Grid */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={post.post_id} className="transform transition-all duration-300 hover:scale-[1.01]">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="group bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                <span>Loading more posts...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span>Load More Posts</span>
                <div className="transform group-hover:translate-y-0.5 transition-transform">
                  ⬇️
                </div>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsList;