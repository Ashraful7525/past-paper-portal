import React from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon 
} from '@heroicons/react/24/solid';
import { useVotePost, useSavePost } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const votePostMutation = useVotePost();
  const savePostMutation = useSavePost();

  const handleVote = (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    
    // Toggle vote if same type, otherwise set new vote
    const newVoteType = post.user_vote === voteType ? 0 : voteType;
    votePostMutation.mutate({ postId: post.post_id, voteType: newVoteType });
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    savePostMutation.mutate(post.post_id);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow">
      <div className="flex gap-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1 pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              post.user_vote === 1 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
            }`}
            disabled={votePostMutation.isPending}
          >
            {post.user_vote === 1 ? (
              <ChevronUpSolidIcon className="h-6 w-6" />
            ) : (
              <ChevronUpIcon className="h-6 w-6" />
            )}
          </button>
          
          <span className={`text-sm font-medium ${
            post.user_vote === 1 ? 'text-orange-500' : 
            post.user_vote === -1 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
          </span>
          
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              post.user_vote === -1 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`}
            disabled={votePostMutation.isPending}
          >
            {post.user_vote === -1 ? (
              <ChevronDownSolidIcon className="h-6 w-6" />
            ) : (
              <ChevronDownIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center">
              <span className="mr-1">{post.department_icon || '🏫'}</span>
              <span className="font-medium">r/{post.department_name || 'General'}</span>
            </span>
            <span className="mx-2">•</span>
            <span>Posted by u/{post.author_username || 'Unknown'}</span>
            <span className="mx-2">•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h3>

          {/* Preview */}
          {post.preview_text && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
              {post.preview_text}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{post.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
            <button className="flex items-center space-x-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>{formatNumber(post.comment_count || 0)} Comments</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center space-x-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors ${
                post.is_saved ? 'text-yellow-600 dark:text-yellow-400' : ''
              }`}
              disabled={savePostMutation.isPending}
            >
              {post.is_saved ? (
                <BookmarkSolidIcon className="h-4 w-4" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
              <span>Save</span>
            </button>

            <div className="flex items-center space-x-1 text-sm">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>{formatNumber(post.download_count || 0)}</span>
            </div>

            <div className="flex items-center space-x-1 text-sm">
              <EyeIcon className="h-4 w-4" />
              <span>{formatNumber(post.view_count || 0)}</span>
            </div>

            {post.file_size && (
              <span className="text-sm text-gray-400 dark:text-gray-500">{post.file_size}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
