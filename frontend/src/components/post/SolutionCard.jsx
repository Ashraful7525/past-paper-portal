import React, { useState } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  UserIcon,
  StarIcon,
  FireIcon,
  ShieldCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import CommentThread from './CommentThread';

const SolutionCard = ({ 
  solution, 
  onVote, 
  onBookmark, 
  onAddComment, 
  onReplyToComment,
  onVoteComment,
  isVoting, 
  isBookmarking, 
  isAddingComment, 
  isReplying,
  isVotingComment,
  formatNumber, 
  formatTimeAgo, 
  user 
}) => {
  const [showComments, setShowComments] = useState(false);

  // Debug logging to see what vote state we're getting
  console.log(`🎯 [SOLUTION CARD] Solution ${solution.id} vote state:`, {
    user_vote: solution.user_vote,
    user_vote_type: typeof solution.user_vote,
    upvotes: solution.upvotes,
    downvotes: solution.downvotes,
    net_votes: solution.net_votes,
    solution_id: solution.id
  });

  const handleVote = (voteType) => {
    const currentVote = solution.user_vote || 0;
    const newVoteType = currentVote === voteType ? 0 : voteType;
    console.log(`🎯 [SOLUTION CARD] Voting on solution ${solution.id}:`, {
      currentVote,
      voteType,
      newVoteType
    });
    onVote(solution.id, newVoteType);
  };

  const handleBookmark = () => {
    onBookmark(solution.id);
  };

  const handleAddComment = (content) => {
    onAddComment(solution.id, content);
  };

  const handleReplyToComment = (commentId, content) => {
    onReplyToComment(solution.id, commentId, content);
  };

  const handleVoteComment = (commentId, voteType) => {
    onVoteComment(solution.id, commentId, voteType);
  };

  return (
    <div className={`border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
      solution.is_verified 
        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10' 
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="p-6">
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote(1)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                solution.user_vote === 1 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!user || isVoting}
              title={solution.user_vote === 1 ? 'You upvoted this - click to remove' : 'Upvote this solution'}
            >
              {solution.user_vote === 1 ? (
                <ChevronUpSolidIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
            
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              solution.user_vote === 1 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 
              solution.user_vote === -1 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
              'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
            }`}>
              {formatNumber(solution.net_votes || 0)}
            </span>
            
            <button
              onClick={() => handleVote(-1)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                solution.user_vote === -1 
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!user || isVoting}
              title={solution.user_vote === -1 ? 'You downvoted this - click to remove' : 'Downvote this solution'}
            >
              {solution.user_vote === -1 ? (
                <ChevronDownSolidIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 dark:text-white">
                      {solution.author_username || 'Anonymous Scholar'}
                    </span>
                    {solution.author_contribution > 100 && (
                      <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                        <FireIcon className="h-3 w-3" />
                        <span className="text-xs font-bold">{solution.author_contribution}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(solution.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {solution.is_verified && (
                  <div className="flex items-center space-x-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">Verified</span>
                  </div>
                )}
                {solution.rating > 0 && (
                  <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full">
                    <StarIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{solution.rating}</span>
                  </div>
                )}
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    solution.is_bookmarked 
                      ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300' 
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  disabled={!user || isBookmarking}
                >
                  {solution.is_bookmarked ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Solution Title */}
            {solution.solution_title && (
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                {solution.solution_title}
              </h3>
            )}

            {/* Solution Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {solution.content}
              </p>
            </div>

            {/* Tags */}
            {solution.tags && solution.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {solution.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-block bg-gray-100 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Solution Actions */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span className="font-medium">{solution.comment_count || 0}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <ChevronUpIcon className="h-4 w-4" />
                  <span className="font-medium">{formatNumber(solution.upvotes || 0)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChevronDownIcon className="h-4 w-4" />
                  <span className="font-medium">{formatNumber(solution.downvotes || 0)}</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <CommentThread
                comments={solution.comments || []}
                onAddComment={handleAddComment}
                onReply={handleReplyToComment}
                onVoteComment={handleVoteComment}
                isAddingComment={isAddingComment}
                isReplying={isReplying}
                isVotingComment={isVotingComment}
                formatTimeAgo={formatTimeAgo}
                user={user}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionCard;