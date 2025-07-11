import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  StarIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newSolution, setNewSolution] = useState('');
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fetch post details
  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });

  // Fetch solutions separately
  const { data: solutions = [], isLoading: solutionsLoading, error: solutionsError } = useQuery({
    queryKey: ['solutions', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/solutions`);
      return response.data;
    },
    enabled: !!postId,
  });

  // Combined loading state
  const isLoading = postLoading || solutionsLoading;

  // Track view when component mounts
  React.useEffect(() => {
    if (postId && post) {
      const trackView = async () => {
        try {
          await api.post(`/posts/${postId}/view`);
        } catch (error) {
          console.error('Failed to track view:', error);
        }
      };
      trackView();
    }
  }, [postId, post]);

  // Vote mutation
  const votePostMutation = useMutation({
    mutationFn: async ({ voteType }) => {
      const response = await api.post(`/posts/${postId}/vote`, { voteType });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
  });

  // Save mutation
  const savePostMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/posts/${postId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
      toast.success('Post saved!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save post');
    },
  });

  // Add solution mutation
  const addSolutionMutation = useMutation({
    mutationFn: async (solutionText) => {
      const response = await api.post(`/posts/${postId}/solutions`, { content: solutionText });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      setNewSolution('');
      setShowSolutionForm(false);
      toast.success('Solution added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add solution');
    },
  });

  // Vote solution mutation
  const voteSolutionMutation = useMutation({
    mutationFn: async ({ solutionId, voteType }) => {
      const response = await api.post(`/solutions/${solutionId}/vote`, { voteType });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to vote on solution');
    },
  });

  // Bookmark solution mutation
  const bookmarkSolutionMutation = useMutation({
    mutationFn: async (solutionId) => {
      const response = await api.post(`/solutions/${solutionId}/bookmark`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      toast.success('Bookmark updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to bookmark solution');
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ solutionId, content, parentCommentId }) => {
      const response = await api.post(`/comments/${solutionId}/comments`, { 
        content, 
        parent_comment_id: parentCommentId 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      setNewComment('');
      setShowCommentForm({});
      setReplyTo(null);
      setReplyText('');
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const handleVote = (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    
    const newVoteType = post.user_vote === voteType ? 0 : voteType;
    votePostMutation.mutate({ voteType: newVoteType });
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    savePostMutation.mutate();
  };

  const handleAddSolution = () => {
    if (!user) {
      toast.error('Please login to add solutions');
      return;
    }
    
    if (!newSolution.trim()) {
      toast.error('Solution cannot be empty');
      return;
    }
    
    addSolutionMutation.mutate(newSolution);
  };

  const handleVoteSolution = (solutionId, voteType) => {
    if (!user) {
      toast.error('Please login to vote on solutions');
      return;
    }
    
    // Find the current solution to get its current vote state
    const currentSolution = solutions.find(s => s.id === solutionId);
    const currentVote = currentSolution?.user_vote || 0;
    
    // Toggle logic: if clicking the same vote type, remove vote (set to 0)
    const newVoteType = currentVote === voteType ? 0 : voteType;
    voteSolutionMutation.mutate({ solutionId, voteType: newVoteType });
  };

  const handleBookmarkSolution = (solutionId) => {
    if (!user) {
      toast.error('Please login to bookmark solutions');
      return;
    }
    bookmarkSolutionMutation.mutate(solutionId);
  };

  const handleAddComment = (solutionId) => {
    if (!user) {
      toast.error('Please login to add comments');
      return;
    }
    
    const content = showCommentForm[solutionId] ? newComment : '';
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    addCommentMutation.mutate({ solutionId, content: content.trim() });
  };

  const handleAddReply = (solutionId, parentCommentId) => {
    if (!user) {
      toast.error('Please login to add replies');
      return;
    }
    
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    
    addCommentMutation.mutate({ 
      solutionId, 
      content: replyText.trim(), 
      parentCommentId 
    });
  };

  const toggleCommentForm = (solutionId) => {
    setShowCommentForm(prev => ({
      ...prev,
      [solutionId]: !prev[solutionId]
    }));
    if (showCommentForm[solutionId]) {
      setNewComment('');
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    setReplyText('');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/feed')}
            className="btn-primary"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleVote(1)}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  post.user_vote === 1 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
                }`}
                disabled={votePostMutation.isPending}
              >
                {post.user_vote === 1 ? (
                  <ChevronUpSolidIcon className="h-8 w-8" />
                ) : (
                  <ChevronUpIcon className="h-8 w-8" />
                )}
              </button>
              
              <span className={`text-lg font-bold ${
                post.user_vote === 1 ? 'text-orange-500' : 
                post.user_vote === -1 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
              </span>
              
              <button
                onClick={() => handleVote(-1)}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  post.user_vote === -1 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                }`}
                disabled={votePostMutation.isPending}
              >
                {post.user_vote === -1 ? (
                  <ChevronDownSolidIcon className="h-8 w-8" />
                ) : (
                  <ChevronDownIcon className="h-8 w-8" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center">
                  <span className="mr-1">{post.department_icon || '🏫'}</span>
                  <span className="font-medium">r/{post.department_name || 'General'}</span>
                </span>
                <span className="mx-2">•</span>
                <span>Posted by u/{post.author_username || 'Unknown'}</span>
                <span className="mx-2">•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.is_verified && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
                  </>
                )}
              </div>

              {/* Question Information */}
              {(post.course_title || post.semester_name || post.question_title || post.question_no) && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    {post.course_title && (
                      <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded">
                        <AcademicCapIcon className="h-4 w-4" />
                        <span className="font-medium">{post.course_title}</span>
                      </div>
                    )}
                    {post.semester_name && (
                      <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span className="font-medium">{post.semester_name}</span>
                      </div>
                    )}
                    {post.question_year && (
                      <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded">
                        <span className="font-medium">{post.question_year}</span>
                      </div>
                    )}
                    {post.question_no && (
                      <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded">
                        <span className="font-medium">Q{post.question_no}</span>
                      </div>
                    )}
                  </div>
                  {post.question_title && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Question: {post.question_title}
                    </h2>
                  )}
                  {post.question_text && (
                    <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                      {post.question_text}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              {/* Content */}
              {post.content && (
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span>{formatNumber(solutions?.length || 0)} Solutions</span>
                </div>

                <button
                  onClick={handleSave}
                  className={`flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    post.is_saved ? 'text-yellow-600 dark:text-yellow-400' : ''
                  }`}
                  disabled={savePostMutation.isPending}
                >
                  {post.is_saved ? (
                    <BookmarkSolidIcon className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                  <span>Save</span>
                </button>

                <div className="flex items-center space-x-2">
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{formatNumber(post.download_count || 0)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-5 w-5" />
                  <span>{formatNumber(post.view_count || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Solutions ({solutions?.length || 0})
            </h2>
            {user && (
              <button
                onClick={() => setShowSolutionForm(!showSolutionForm)}
                className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Solution</span>
              </button>
            )}
          </div>

          {/* Add Solution Form */}
          {showSolutionForm && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <textarea
                value={newSolution}
                onChange={(e) => setNewSolution(e.target.value)}
                placeholder="Share your solution..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
              <div className="flex justify-end space-x-3 mt-3">
                <button
                  onClick={() => setShowSolutionForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSolution}
                  disabled={addSolutionMutation.isPending || !newSolution.trim()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addSolutionMutation.isPending ? 'Adding...' : 'Add Solution'}
                </button>
              </div>
            </div>
          )}

          {/* Solutions List */}
          {solutionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading solutions...</p>
            </div>
          ) : solutions && solutions.length > 0 ? (
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div
                  key={solution.id || index}
                  className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
                    solution.is_verified 
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          onClick={() => handleVoteSolution(solution.id, 1)}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            solution.user_vote === 1 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
                          }`}
                          disabled={!user}
                        >
                          {solution.user_vote === 1 ? (
                            <ChevronUpSolidIcon className="h-5 w-5" />
                          ) : (
                            <ChevronUpIcon className="h-5 w-5" />
                          )}
                        </button>
                        
                        <span className={`text-sm font-bold ${
                          solution.user_vote === 1 ? 'text-orange-500' : 
                          solution.user_vote === -1 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {formatNumber(solution.net_votes || 0)}
                        </span>
                        
                        <button
                          onClick={() => handleVoteSolution(solution.id, -1)}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            solution.user_vote === -1 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                          }`}
                          disabled={!user}
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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {solution.author_username || 'Anonymous'}
                                </span>
                                {solution.author_contribution > 100 && (
                                  <div className="flex items-center space-x-1">
                                    <FireIcon className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                      {solution.author_contribution}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(solution.created_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {solution.is_verified && (
                              <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs">
                                <ShieldCheckIcon className="h-3 w-3" />
                                <span>Verified</span>
                              </div>
                            )}
                            {solution.rating > 0 && (
                              <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs">
                                <StarIcon className="h-3 w-3" />
                                <span>{solution.rating}</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleBookmarkSolution(solution.id)}
                              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                solution.is_bookmarked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'
                              }`}
                              disabled={!user}
                            >
                              {solution.is_bookmarked ? (
                                <BookmarkSolidIcon className="h-4 w-4" />
                              ) : (
                                <BookmarkIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Solution Title */}
                        {solution.solution_title && (
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            {solution.solution_title}
                          </h3>
                        )}

                        {/* Solution Content */}
                        <div className="prose dark:prose-invert max-w-none mb-4">
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
                                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Solution Actions */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-3">
                          <div className="flex items-center space-x-1">
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                            <span>{solution.comment_count || 0} comments</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChevronUpIcon className="h-4 w-4" />
                            <span>{formatNumber(solution.upvotes || 0)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChevronDownIcon className="h-4 w-4" />
                            <span>{formatNumber(solution.downvotes || 0)}</span>
                          </div>
                          {user && (
                            <button
                              onClick={() => toggleCommentForm(solution.id)}
                              className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <PlusIcon className="h-4 w-4" />
                              <span>Add Comment</span>
                            </button>
                          )}
                        </div>

                        {/* Add Comment Form */}
                        {showCommentForm[solution.id] && (
                          <div className="mt-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows="3"
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => toggleCommentForm(solution.id)}
                                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddComment(solution.id)}
                                disabled={addCommentMutation.isPending || !newComment.trim()}
                                className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {addCommentMutation.isPending ? 'Adding...' : 'Comment'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Comments Section */}
                        {solution.comments && solution.comments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                              Comments ({solution.comments.length})
                            </h4>
                            <div className="space-y-3">
                              {solution.comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                                        {comment.author_username}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimeAgo(comment.created_at)}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {comment.net_votes} votes
                                      </span>
                                    </div>
                                    {user && (
                                      <button
                                        onClick={() => handleReplyClick(comment.id)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                                      >
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {comment.content}
                                  </p>
                                  
                                  {/* Reply Form */}
                                  {replyTo === comment.id && (
                                    <div className="mt-2 p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows="2"
                                      />
                                      <div className="flex justify-end space-x-2 mt-2">
                                        <button
                                          onClick={() => setReplyTo(null)}
                                          className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleAddReply(solution.id, comment.id)}
                                          disabled={addCommentMutation.isPending || !replyText.trim()}
                                          className="px-2 py-1 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          {addCommentMutation.isPending ? 'Replying...' : 'Reply'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Replies */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-2 ml-4 space-y-2">
                                      {comment.replies.map((reply) => (
                                        <div key={reply.id} className="bg-gray-100 dark:bg-gray-600/50 p-2 rounded">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-medium text-xs text-gray-900 dark:text-white">
                                              {reply.author_username}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {formatTimeAgo(reply.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-700 dark:text-gray-300">
                                            {reply.content}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No solutions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Be the first to share your solution!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;