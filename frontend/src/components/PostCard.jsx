import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  AcademicCapIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon 
} from '@heroicons/react/24/solid';
import { useVotePost, useSavePost } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ProfilePicture from './common/ProfilePicture';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const votePostMutation = useVotePost();
  const savePostMutation = useSavePost();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleVote = (voteType, e) => {
    e.stopPropagation(); // Prevent card click when voting
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    
    // Toggle vote if same type, otherwise set new vote
    const newVoteType = post.user_vote === voteType ? 0 : voteType;
    votePostMutation.mutate({ postId: post.post_id, voteType: newVoteType });
  };

  const handleSave = (e) => {
    e.stopPropagation(); // Prevent card click when saving
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    savePostMutation.mutate(post.post_id);
  };

  const handleDownload = async (e) => {
    e.stopPropagation(); // Prevent card click when downloading
    if (!post.file_url || isDownloading) return;

    setIsDownloading(true);
    
    try {
      // Get the filename from the URL or create a default one
      const urlParts = post.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1] || `${post.title || 'file'}.${post.file_url.split('.').pop()}`;
      
      // Fetch the file
      const response = await fetch(post.file_url);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Optional: Update download count via API
      // You can add an API call here to increment download count
      
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening in new tab
      window.open(post.file_url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post.post_id}`);
  };

  const handleCommentsClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking comments
    navigate(`/post/${post.post_id}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return posted.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: posted.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/20 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 pt-1">
          <button
            onClick={(e) => handleVote(1, e)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              post.user_vote === 1 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' 
                : 'text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            } ${votePostMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={votePostMutation.isPending}
          >
            {votePostMutation.isPending ? (
              <div className="h-6 w-6 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
            ) : post.user_vote === 1 ? (
              <ChevronUpSolidIcon className="h-6 w-6" />
            ) : (
              <ChevronUpIcon className="h-6 w-6" />
            )}
          </button>
          
          <span className={`text-sm font-bold px-2 py-1 rounded-full ${
            post.user_vote === 1 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 
            post.user_vote === -1 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
            'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
          }`}>
            {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
          </span>
          
          <button
            onClick={(e) => handleVote(-1, e)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              post.user_vote === -1 
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm' 
                : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            } ${votePostMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={votePostMutation.isPending}
          >
            {votePostMutation.isPending ? (
              <div className="h-6 w-6 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
            ) : post.user_vote === -1 ? (
              <ChevronDownSolidIcon className="h-6 w-6" />
            ) : (
              <ChevronDownIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header with Profile Picture */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            <ProfilePicture 
              user={{ 
                username: post.author_username, 
                author_username: post.author_username,
                profile_picture_url: post.author_profile_picture 
              }} 
              size="sm" 
              className="mr-3"
            />
            <span className="flex items-center">
              <span className="mr-2 text-base">{post.department_icon || '🏫'}</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">r/{post.department_name || 'General'}</span>
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span>Posted by <span className="text-gray-600 dark:text-gray-400 font-medium hover:text-blue-600 dark:hover:text-blue-400">u/{post.author_username || 'Unknown'}</span></span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(post.created_at)}</span>
            {post.is_verified && (
              <>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full mr-1"></span>
                  Verified
                </span>
              </>
            )}
          </div>

          {/* Question Information */}
          {(post.course_title || post.semester_name || post.question_title || post.question_no) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
                {post.course_title && (
                  <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 max-w-xs">
                    <AcademicCapIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="font-semibold truncate" title={post.course_title}>{post.course_title}</span>
                  </div>
                )}
                {post.semester_name && (
                  <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 max-w-xs">
                    <CalendarDaysIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="font-semibold truncate" title={post.semester_name}>{post.semester_name}</span>
                  </div>
                )}
                {post.question_year && (
                  <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700">
                    <span className="font-semibold">{post.question_year}</span>
                  </div>
                )}
                {post.question_no && (
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700">
                    <span className="font-semibold">Q{post.question_no}</span>
                  </div>
                )}
              </div>
              {post.question_title && (
                <div className="text-sm text-gray-700 dark:text-gray-400 font-semibold mb-2">
                  Question: <span className="text-gray-600 dark:text-gray-500 font-medium">{post.question_title}</span>
                </div>
              )}
              {post.question_text && (
                <div className="text-sm text-gray-600 dark:text-gray-500 line-clamp-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  {post.question_text}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>

          {/* Preview */}
          {post.preview_text && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
              {post.preview_text}
            </p>
          )}

          {/* Image Display */}
          {post.file_url && isImageFile(post.file_url) && (
            <div className="mb-4">
              <img 
                src={post.file_url} 
                alt={post.title || 'Uploaded image'}
                className="w-full max-w-md h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 self-center font-medium">
                  +{post.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
            <button 
              onClick={handleCommentsClick}
              className="flex items-center space-x-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.solution_count || 0)} Solutions</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                post.is_saved 
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              disabled={savePostMutation.isPending}
            >
              {post.is_saved ? (
                <BookmarkSolidIcon className="h-4 w-4" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
              <span className="font-medium">{post.is_saved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleDownload}
              className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                post.file_url && !isDownloading
                  ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!post.file_url || isDownloading}
              title={
                isDownloading 
                  ? 'Downloading...' 
                  : post.file_url 
                    ? 'Download file' 
                    : 'No file available'
              }
            >
              {isDownloading ? (
                <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isDownloading ? 'Downloading...' : 'Download'}
              </span>
            </button>

            <div className="flex items-center space-x-2 text-sm px-3 py-2">
              <EyeIcon className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.view_count || 0)}</span>
            </div>

            {post.file_size && (
              <div className="flex items-center space-x-2 text-sm px-3 py-2">
                <span className="text-gray-400 dark:text-gray-500 font-medium">{post.file_size}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
