import React, { useState } from 'react';
import {
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
} from '@heroicons/react/24/solid';
import CommentForm from './CommentForm';
import ReportModal from '../common/ReportModal';
import { useAuth } from '../../contexts/AuthContext';

const CommentCard = ({
  comment,
  onReply,
  onVote,
  isReplying,
  isVoting,
  formatTimeAgo,
  depth = 0,
  user,
  isLastChild = false,
}) => {
  const { user: currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [repliesCollapsed, setRepliesCollapsed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const maxDepth = 1; // Only one reply level

  const handleReply = (content) => {
    onReply(comment.comment_id || comment.id, content);
    setShowReplyForm(false);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleVote = (voteType) => {
    if (!user) return;
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

  // Avatar fallback: first letter
  const avatar = (
    <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
      {authorUsername.charAt(0).toUpperCase()}
    </div>
  );

  // Replies collapse/expand
  const repliesSection = replies.length > 0 && depth < maxDepth && (
    <div className="mt-2 ml-12">
      <button
        onClick={() => setRepliesCollapsed((c) => !c)}
        className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline mb-1 focus:outline-none"
      >
        {repliesCollapsed ? (
          <ChevronDownIcon className="h-4 w-4 mr-1" />
        ) : (
          <ChevronUpIcon className="h-4 w-4 mr-1" />
        )}
        {repliesCollapsed
          ? `Show ${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`
          : `Hide replies`}
      </button>
      {!repliesCollapsed && (
        <div className="space-y-2">
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
    </div>
  );

  // Main card style
  return (
    <div
      id={`comment-${comment.comment_id || comment.id}`}
      className={`flex items-start w-full py-3 px-2 rounded-xl bg-white dark:bg-gray-800 ${depth === 0 ? 'shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md' : ''} transition-all duration-200 group`}
    >
      {avatar}
      <div className="flex-1 ml-3 min-w-0 flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {authorUsername}
          </span>
          <span className="text-xs text-gray-400 select-none">&middot;</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
        <div className="mb-2">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words mt-1.5">
            {commentText}
          </p>
        </div>
        {/* Action row: only show Reply for top-level comments */}
        <div className="flex items-center space-x-2 mt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded-full transition-all duration-200 focus:ring-2 focus:ring-emerald-500 ${
              userVote === 1
                ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 shadow'
                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!user || isVoting}
            title={userVote === 1 ? 'You upvoted this comment - click to remove' : 'Upvote this comment'}
            style={{ lineHeight: 1 }}
          >
            {userVote === 1 ? (
              <ChevronUpSolidIcon className="h-4 w-4" />
            ) : (
              <ChevronUpIcon className="h-4 w-4" />
            )}
          </button>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
            userVote === 1
              ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
              : userVote === -1
              ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
              : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
          }`}>
            {netVotes}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded-full transition-all duration-200 focus:ring-2 focus:ring-red-500 ${
              userVote === -1
                ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20 shadow'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!user || isVoting}
            title={userVote === -1 ? 'You downvoted this comment - click to remove' : 'Downvote this comment'}
            style={{ lineHeight: 1 }}
          >
            {userVote === -1 ? (
              <ChevronDownSolidIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
          {/* Only show Reply for top-level comments */}
          {depth === 0 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canReply}
            >
              Reply
            </button>
          )}
          
          {/* Report Button */}
          {currentUser && (
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-medium text-gray-400 hover:text-red-500 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Report this comment"
            >
              <FlagIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            title="More actions"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
        {showReplyForm && canReply && (
          <div className="mt-2 w-full">
            <CommentForm
              onSubmit={handleReply}
              onCancel={handleCancelReply}
              placeholder="Write a reply..."
              buttonText="Reply"
              isSubmitting={isReplying}
              isReply={true}
              user={user}
            />
          </div>
        )}
        {/* Replies section: align with action row, not avatar */}
        {replies.length > 0 && depth < maxDepth && (
          <div>
            <button
              onClick={() => setRepliesCollapsed((c) => !c)}
              className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline mb-1 focus:outline-none ml-12 mt-1.5"
              style={{ marginLeft: 0 }}
            >
              {repliesCollapsed ? (
                <ChevronDownIcon className="h-4 w-4 mr-1" />
              ) : (
                <ChevronUpIcon className="h-4 w-4 mr-1" />
              )}
              {repliesCollapsed
                ? `Show ${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`
                : `Hide replies`}
            </button>
            {!repliesCollapsed && (
              <div className="space-y-1 ml-12" style={{ marginLeft: 0 }}>
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
          </div>
        )}
      </div>
      
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="comment"
        contentId={comment.comment_id || comment.id}
        contentTitle={`Comment by ${comment.author_username || 'Anonymous'}`}
      />
    </div>
  );
};

export default CommentCard;