import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  EyeIcon,
  MessageCircleIcon,
  BookmarkIcon,
  FileTextIcon,
  CheckCircleIcon
} from 'lucide-react';

const UserBookmarksList = ({ savedPosts, bookmarkedSolutions, isLoading, isError, error }) => {
  const [activeTab, setActiveTab] = useState('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">
          Failed to load bookmarks: {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  const posts = savedPosts || [];
  const solutions = bookmarkedSolutions || [];
  const hasContent = posts.length > 0 || solutions.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookmarkIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          No bookmarks yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You haven't bookmarked any questions or solutions yet. Save interesting content to find it easily later!
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Explore Content
        </Link>
      </div>
    );
  }

  const handleSolutionClick = (e, questionId, solutionId) => {
    setTimeout(() => {
      const solutionElement = document.getElementById(`solution-${solutionId}`);
      if (solutionElement) {
        solutionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        solutionElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          solutionElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 3000);
      }
    }, 100);
  };

  const filteredPosts = activeTab === 'solutions' ? [] : posts;
  const filteredSolutions = activeTab === 'posts' ? [] : solutions;

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          All ({posts.length + solutions.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Questions ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'solutions'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Solutions ({solutions.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Bookmarked Posts */}
        {filteredPosts.map((post) => (
          <Link
            key={`post-${post.post_id}`}
            to={`/post/${post.post_id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/25 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">QUESTION</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>
                
                {post.preview_text && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.preview_text}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>{post.upvotes || 0}</span>
                    <ArrowDownIcon className="w-4 h-4 ml-1" />
                    <span>{post.downvotes || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{post.view_count || 0} views</span>
                  </div>
                  
                  <span className="text-xs">
                    Bookmarked {formatTimeAgo(post.saved_at)}
                  </span>
                </div>
                
                {post.department_name && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {post.department_name}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <BookmarkIcon className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
            </div>
          </Link>
        ))}

        {/* Bookmarked Solutions */}
        {filteredSolutions.map((solution) => {
          const postUrl = `/post/${solution.question_id || solution.post_id}?highlight=solution&id=${solution.id}`;
          
          return (
            <Link
              key={`solution-${solution.id}`}
              to={postUrl}
              onClick={(e) => handleSolutionClick(e, solution.question_id, solution.id)}
              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/25 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">SOLUTION</span>
                    {solution.is_verified && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {solution.question_title || 'Solution'}
                  </h3>
                  
                  {solution.content && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {solution.content.length > 200 
                        ? `${solution.content.substring(0, 200)}...` 
                        : solution.content
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <ArrowUpIcon className="w-4 h-4" />
                      <span>{solution.upvotes || 0}</span>
                      <ArrowDownIcon className="w-4 h-4 ml-1" />
                      <span>{solution.downvotes || 0}</span>
                    </div>
                    
                    <span className="text-xs">
                      Bookmarked {formatTimeAgo(solution.bookmarked_at)}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    {solution.is_verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Verified Solution
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Community Solution
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <BookmarkIcon className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UserBookmarksList;