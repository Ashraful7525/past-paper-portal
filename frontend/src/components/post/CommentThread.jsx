import React, { useState } from 'react';
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
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleAddComment = (content) => {
    onAddComment(content);
    setShowCommentForm(false);
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
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h4>
        {user && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Comment</span>
          </button>
        )}
      </div>

      {/* Add Comment Form */}
      {showCommentForm && (
        <div className="mb-4">
          <CommentForm
            onSubmit={handleAddComment}
            onCancel={handleCancelComment}
            placeholder="Add a thoughtful comment..."
            buttonText="Add Comment"
            isSubmitting={isAddingComment}
            isReply={false}
          />
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentThread;