import React, { useState } from 'react';
import { 
  UserIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon
} from '@heroicons/react/24/solid';
import CommentForm from './CommentForm';

const CommentCard = ({ 
  comment, 
  onReply, 
  onVote,
  isReplying, 
  isVoting,
  formatTimeAgo, 
  depth = 0,
  user,
  isLastChild = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 1; // Limit to 1 level of nesting

  const handleReply = (content) => {
    onReply(comment.comment_id || comment.id, content);
    setShowReplyForm(false);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleVote = (voteType) => {
    if (!user) return;
    
    // Toggle vote: if same vote type, remove it (set to 0), otherwise set new vote
    const newVoteType = comment.user_vote === voteType ? 0 : voteType;
    onVote(comment.comment_id || comment.id, newVoteType);
  };

  const canReply = depth < maxDepth && user;
  const netVotes = (comment.upvotes || 0) - (comment.downvotes || 0);
  const commentId = comment.comment_id || comment.id;
  const commentText = comment.comment_text || comment.content;
  const authorUsername = comment.author_username || 'Anonymous';
  const createdAt = comment.created_at;
  const userVote = comment.user_vote || 0;
  const replies = comment.replies || [];

  // Debug logging to see what vote state we're getting for comments
  console.log(`🎯 [COMMENT CARD] Comment ${commentId} vote state:`, {
    user_vote: comment.user_vote,
    user_vote_type: typeof comment.user_vote,
    userVote,
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    netVotes,
    comment_id: commentId
  });

  return (
    <div className="relative">
      <div className={`flex ${depth > 0 ? 'ml-6' : ''}`}>
        {/* Tree connector for nested replies */}
        {depth > 0 && (
          <div className="flex-shrink-0 w-4 mr-2 relative">
            {/* Vertical line - continuous from top to bottom, stops at horizontal connector for final reply */}
            <div className={`absolute left-0 top-0 w-0.5 bg-gray-400 dark:bg-gray-500 ${
              isLastChild ? 'h-1/2' : 'bottom-0'
            }`}></div>
            {/* Horizontal connector - connects to center of card */}
            <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-400 dark:bg-gray-500 transform -translate-y-1/2"></div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg max-w-2xl">
            {/* Header: Author and Timestamp (Most Important) */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-semibold text-base text-gray-900 dark:text-white">
                  {authorUsername}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(createdAt)}
                </span>
              </div>
              
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Reply
                </button>
              )}
            </div>

            {/* Comment Content (Second Priority) */}
            <div className="mb-3 ml-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {commentText}
              </p>
            </div>

            {/* Vote Section (Third Priority) */}
            <div className="flex items-center justify-between ml-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleVote(1)}
                    className={`p-1 rounded transition-all duration-200 ${
                      userVote === 1 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!user || isVoting}
                    title={userVote === 1 ? 'You upvoted this comment - click to remove' : 'Upvote this comment'}
                  >
                                  {userVote === 1 ? (
                <ChevronUpSolidIcon className="h-4 w-4" />
              ) : (
                <ChevronUpIcon className="h-4 w-4" />
              )}
                  </button>
                  
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    userVote === 1 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 
                    userVote === -1 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
                    'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
                  }`}>
                    {netVotes}
                  </span>
                  
                  <button
                    onClick={() => handleVote(-1)}
                    className={`p-1 rounded transition-all duration-200 ${
                      userVote === -1 
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!user || isVoting}
                    title={userVote === -1 ? 'You downvoted this comment - click to remove' : 'Downvote this comment'}
                  >
                                  {userVote === -1 ? (
                <ChevronDownSolidIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
                  </button>
                </div>
                

              </div>
            </div>
            
          </div>
          
          {/* Reply Form - Detached box underneath */}
          {showReplyForm && canReply && (
            <div className="mt-2 ml-6 max-w-2xl">
              <CommentForm
                onSubmit={handleReply}
                onCancel={handleCancelReply}
                placeholder="Write a reply..."
                buttonText="Reply"
                isSubmitting={isReplying}
                isReply={true}
              />
            </div>
          )}
          
          {/* Nested Replies - Only show if depth < maxDepth */}
          {replies.length > 0 && depth < maxDepth && (
            <div className="mt-2 space-y-2">
              {replies.map((reply, index) => (
                <CommentCard
                  key={reply.comment_id || reply.id}
                  comment={reply}
                  onReply={onReply}
                  onVote={onVote}
                  isReplying={isReplying}
                  isVoting={isVoting}
                  formatTimeAgo={formatTimeAgo}
                  depth={depth + 1}
                  user={user}
                  isLastChild={index === replies.length - 1}
                />
              ))}
            </div>
          )}
          
          {/* Show message if max depth reached */}
          {replies.length > 0 && depth >= maxDepth && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg max-w-2xl ml-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💬 {replies.length} more replies available. 
                <span className="font-medium"> Maximum nesting level reached.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;