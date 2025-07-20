import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

const SORT_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'newest', label: 'Newest' },
];

const sortComments = (comments, sortBy) => {
  if (sortBy === 'newest') {
    return [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  // Default: Top (by net votes)
  return [...comments].sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
};

const CommentThread = ({ 
  comments = [], 
  onAddComment, 
  onReply, 
  onVoteComment,
  isAddingComment, 
  isReplying,
  isVotingComment,
  formatTimeAgo, 
  user 
}) => {
  const [showCommentForm, setShowCommentForm] = useState(true);
  const [sortBy, setSortBy] = useState('top');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (showCommentForm && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showCommentForm]);

  const handleAddComment = (content) => {
    onAddComment(content);
    setShowCommentForm(true);
  };

  const handleCancelComment = () => {
    setShowCommentForm(false);
  };

  const handleReply = (commentId, content) => {
    onReply(commentId, content);
  };

  const handleVoteComment = (commentId, voteType) => {
    onVoteComment(commentId, voteType);
  };

  const sortedComments = sortComments(comments, sortBy);

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-base">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h4>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-comments" className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sort by:</label>
          <select
            id="sort-comments"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {user && showCommentForm && (
        <div className="mb-3">
          <CommentForm
            ref={textareaRef}
            onSubmit={handleAddComment}
            onCancel={handleCancelComment}
            placeholder="Add a public comment..."
            buttonText="Comment"
            isSubmitting={isAddingComment}
            isReply={false}
            user={user}
          />
        </div>
      )}
      {user && !showCommentForm && (
        <div className="mb-3">
          <button
            onClick={() => setShowCommentForm(true)}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-base"
          >
            <span className="text-lg">+</span>
            <span>Add Comment</span>
          </button>
        </div>
      )}
      {sortedComments.length > 0 ? (
        <div className="space-y-2">
          {sortedComments.map((comment, index) => (
            <CommentCard
              key={comment.comment_id}
              comment={comment}
              onReply={handleReply}
              onVote={handleVoteComment}
              isReplying={isReplying}
              isVoting={isVotingComment}
              formatTimeAgo={formatTimeAgo}
              depth={0}
              user={user}
              isLastChild={index === sortedComments.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-base">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentThread;