import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { usePostDetail } from '../hooks/usePostDetail';
import { formatNumber, formatTimeAgo } from '../utils/formatters';
import PostHeader from '../components/post/PostHeader';
import PostBody from '../components/post/PostBody';
import CommentForm from '../components/post/CommentForm';
import SolutionCard from '../components/post/SolutionCard';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const viewTrackedRef = useRef(false); // Track if view has been tracked for this component instance

  const {
    post,
    solutions,
    user,
    isLoading,
    postError,
    isVotingPost,
    isSavingPost,
    isAddingSolution,
    isVotingSolution,
    isBookmarkingSolution,
    isAddingComment,
    isVotingComment,
    handleVotePost,
    handleSavePost,
    handleAddSolution,
    handleVoteSolution,
    handleBookmarkSolution,
    handleAddComment,
    handleVoteComment,
    handleTrackView,
  } = usePostDetail(postId);

  // Track view only once when post is loaded
  useEffect(() => {
    if (post && !viewTrackedRef.current) {
      viewTrackedRef.current = true;
      handleTrackView();
    }
  }, [post, handleTrackView]);

  // Reset view tracking when postId changes
  useEffect(() => {
    viewTrackedRef.current = false;
  }, [postId]);

  const handleAddSolutionSubmit = (solutionText) => {
    handleAddSolution(solutionText);
    setShowSolutionForm(false);
  };

  const handleCancelSolution = () => {
    setShowSolutionForm(false);
  };

  const handleSolutionCommentAdd = (solutionId, content) => {
    handleAddComment(solutionId, content);
  };

  const handleSolutionCommentReply = (solutionId, commentId, content) => {
    handleAddComment(solutionId, content, commentId);
  };

  const handleSolutionCommentVote = (solutionId, commentId, voteType) => {
    handleVoteComment(solutionId, commentId, voteType);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <LightBulbIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            The academic resource you're looking for doesn't exist or has been removed from our knowledge base.
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PostHeader 
        post={post}
        onVote={handleVotePost}
        isVoting={isVotingPost}
        formatNumber={formatNumber}
        formatTimeAgo={formatTimeAgo}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex gap-6">
              <div className="flex flex-col items-center space-y-3 pt-2">
                {/* Empty space for vote alignment with header */}
              </div>
              <PostBody 
                post={post}
                onSave={handleSavePost}
                isSaving={isSavingPost}
                formatNumber={formatNumber}
              />
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <LightBulbIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    💡 Solutions & Insights
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {solutions?.length || 0} community solutions available
                  </p>
                </div>
              </div>
              
              {user && (
                <button
                  onClick={() => setShowSolutionForm(!showSolutionForm)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Share Solution</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Add Solution Form */}
            {showSolutionForm && (
              <div className="mb-8">
                <CommentForm
                  onSubmit={handleAddSolutionSubmit}
                  onCancel={handleCancelSolution}
                  placeholder="Share your solution, explanation, or insights that could help fellow students..."
                  buttonText="Publish Solution"
                  isSubmitting={isAddingSolution}
                  isReply={false}
                />
              </div>
            )}

            {/* Solutions List */}
            {solutions && solutions.length > 0 ? (
              <div className="space-y-6">
                {solutions.map((solution, index) => (
                  <SolutionCard
                    key={solution.id || index}
                    solution={solution}
                    onVote={handleVoteSolution}
                    onBookmark={handleBookmarkSolution}
                    onAddComment={handleSolutionCommentAdd}
                    onReplyToComment={handleSolutionCommentReply}
                    onVoteComment={handleSolutionCommentVote}
                    isVoting={isVotingSolution}
                    isBookmarking={isBookmarkingSolution}
                    isAddingComment={isAddingComment}
                    isReplying={isAddingComment}
                    isVotingComment={isVotingComment}
                    formatNumber={formatNumber}
                    formatTimeAgo={formatTimeAgo}
                    user={user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LightBulbIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Solutions Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  This academic question is waiting for brilliant minds like yours to share insights and solutions.
                </p>
                {user && (
                  <button
                    onClick={() => setShowSolutionForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                  >
                    Be the First to Help
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;