import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// Utility function to check if a file is an image by MIME type
function isImageFile(file) {
  // file.type preferred, fallback to extension if needed
  if (file.type) {
    return file.type.startsWith('image/');
  }
  if (file.name) {
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
  }
  return false;
}
import { PlusIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { usePostDetail } from '../hooks/usePostDetail';
import { useFilters } from '../contexts/FilterContext';
import { formatNumber, formatTimeAgo } from '../utils/formatters';
import PostBody from '../components/post/PostBody';
import SolutionForm from '../components/post/SolutionForm';
import SolutionCard from '../components/post/SolutionCard';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { filters } = useFilters();
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const viewTrackedRef = useRef(false); // Track if view has been tracked for this component instance

  // Get highlighting parameters from URL
  const highlightType = searchParams.get('highlight'); // 'solution' or 'comment'
  const highlightId = searchParams.get('id');

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

  // Smart navigation function to handle different return paths
  const handleGoBack = () => {
    const fromAdmin = location.state?.from === 'admin-dashboard';
    const adminState = location.state?.adminState;
    
    console.log('🔙 PostDetail handleGoBack called');
    console.log('📍 Location state:', location.state);
    console.log('🏛️ From admin:', fromAdmin);
    console.log('💾 Admin state:', adminState);
    
    if (fromAdmin && adminState) {
      // Return to admin dashboard with preserved state
      console.log('🎯 Navigating back to admin dashboard with state');
      navigate('/admin/dashboard', { 
        state: { 
          from: 'post-detail',
          adminState: adminState
        } 
      });
    } else {
      // Default return to feed with filter preservation
      console.log('🎯 Navigating back to feed with filters');
      navigate('/feed', { 
        state: { 
          filters: filters,
          preserveFilters: true 
        } 
      });
    }
  };

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

  // Scroll to highlighted content when data is loaded
  useEffect(() => {
    if (highlightType && highlightId && (post || solutions.length > 0)) {
      // Add a small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(`${highlightType}-${highlightId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a temporary highlight effect
          element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30', 'ring-2', 'ring-yellow-400', 'rounded-lg');
          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30', 'ring-2', 'ring-yellow-400', 'rounded-lg');
          }, 3000);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [highlightType, highlightId, post, solutions]);

  const handleAddSolutionSubmit = (solutionText, file) => {
    handleAddSolution(solutionText, file);
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
            onClick={() => {
              const fromAdmin = location.state?.from === 'admin-dashboard';
              const adminState = location.state?.adminState;
              
              if (fromAdmin && adminState) {
                // Return to admin dashboard with preserved state
                navigate('/admin/dashboard', { 
                  state: { 
                    from: 'post-detail',
                    adminState: adminState
                  } 
                });
              } else {
                // Default return to feed with filters
                navigate('/feed', { 
                  state: { 
                    filters: filters,
                    preserveFilters: true 
                  } 
                });
              }
            }}
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Combined Post Header and Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white p-8">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-200 hover:text-white mb-4 transition-colors group"
            >
              <svg className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Feed</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">{post.department_icon || '📚'}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                  <span className="font-medium">r/{post.department_name || 'General'}</span>
                  <span>•</span>
                  <span>by u/{post.author_username || 'Unknown'}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.created_at)}</span>
                  {post.is_verified && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Verified
                      </span>
                    </>
                  )}
                </div>
                {/* Question Information (restored from PostHeader) */}
                {(post.course_title || post.semester_name || post.question_title || post.question_no) && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {post.course_title && (
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" /></svg>
                          <span className="font-semibold">{post.course_title}</span>
                        </div>
                      )}
                      {post.semester_name && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="font-semibold">{post.semester_name}</span>
                        </div>
                      )}
                      {post.question_year && (
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700">
                          <span className="font-semibold">{post.question_year}</span>
                        </div>
                      )}
                      {post.question_no && (
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-700">
                          <span className="font-semibold">Q{post.question_no}</span>
                        </div>
                      )}
                    </div>
                    {post.question_title && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          📋 Question: {post.question_title}
                        </h2>
                        {post.question_text && (
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {post.question_text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section with Voting */}
          <div className="p-8">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center space-y-3 pt-2">
                <button
                  onClick={() => handleVotePost(post.user_vote === 1 ? 0 : 1)}
                  className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    post.user_vote === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  disabled={isVotingPost}
                >
                  <svg className="h-8 w-8" fill={post.user_vote === 1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                <span className={`text-xl font-bold ${
                  post.user_vote === 1 ? 'text-emerald-600' : 
                  post.user_vote === -1 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
                </span>
                
                <button
                  onClick={() => handleVotePost(post.user_vote === -1 ? 0 : -1)}
                  className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    post.user_vote === -1 ? 'text-red-600 bg-red-50 dark:bg-red-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  disabled={isVotingPost}
                >
                  <svg className="h-8 w-8" fill={post.user_vote === -1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Post Body */}
              <div className="flex-1">
                <PostBody 
                  post={post}
                  onSave={handleSavePost}
                  isSaving={isSavingPost}
                  formatNumber={formatNumber}
                  solutionsCount={solutions?.length || 0}
                />

                {/* File Previews */}
                {Array.isArray(post.files) && post.files.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {post.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex-shrink-0">
                          {isImageFile(file) ? (
                            <img
                              src={file.url}
                              alt={file.name || `Attachment ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7V3a2 2 0 012-2h6a2 2 0 012 2v4" />
                              <rect width="14" height="14" x="5" y="7" rx="2" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{file.name || `Attachment ${idx + 1}`}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{file.type || 'Unknown type'}</span>
                        </div>
                        <a
                          href={file.url}
                          download={file.name}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                    Solutions & Insights
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
                <SolutionForm
                  onSubmit={handleAddSolutionSubmit}
                  onCancel={handleCancelSolution}
                  placeholder="Share your solution, explanation, or insights that could help fellow students..."
                  buttonText="Publish Solution"
                  isSubmitting={isAddingSolution}
                  user={user}
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