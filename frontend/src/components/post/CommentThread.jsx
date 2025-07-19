import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

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
  const textareaRef = useRef(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (showCommentForm && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showCommentForm]);

  const handleAddComment = (content) => {
    onAddComment(content);
    // Keep the form open for more comments
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

  return (
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white text-base">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Add Comment Form - Always visible when user is logged in */}
      {user && showCommentForm && (
        <div className="mb-3">
          <CommentForm
            ref={textareaRef}
            onSubmit={handleAddComment}
            onCancel={handleCancelComment}
            placeholder="Add a thoughtful comment..."
            buttonText="Add Comment"
            isSubmitting={isAddingComment}
            isReply={false}
          />
        </div>
      )}

      {/* Show button to reopen form if it was closed */}
      {user && !showCommentForm && (
        <div className="mb-3">
          <button
            onClick={() => setShowCommentForm(true)}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium text-base"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Comment</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment, index) => (
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
              isLastChild={index === comments.length - 1}
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