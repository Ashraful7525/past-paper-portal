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
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpSolidIcon,
  ChevronDownIcon as ChevronDownSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon
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
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-200 hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Feed</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">{post.department_icon || '📚'}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-gray-200 mb-2">
                <span className="font-semibold">r/{post.department_name || 'General'}</span>
                <span>•</span>
                <span>by u/{post.author_username || 'Unknown'}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.is_verified && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <ShieldCheckIcon className="h-4 w-4" />
                      Verified
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center space-y-3 pt-2">
                <button
                  onClick={() => handleVote(1)}
                  className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    post.user_vote === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
                  }`}
                  disabled={votePostMutation.isPending}
                >
                  {post.user_vote === 1 ? (
                    <ChevronUpSolidIcon className="h-8 w-8" />
                  ) : (
                    <ChevronUpIcon className="h-8 w-8" />
                  )}
                </button>
                
                <span className={`text-xl font-bold ${
                  post.user_vote === 1 ? 'text-emerald-600' : 
                  post.user_vote === -1 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {formatNumber((post.upvotes || 0) - (post.downvotes || 0))}
                </span>
                
                <button
                  onClick={() => handleVote(-1)}
                  className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                    post.user_vote === -1 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 shadow-lg' : 'text-gray-400 dark:text-gray-500'
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
                {/* Question Information */}
                {(post.course_title || post.semester_name || post.question_title || post.question_no) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      {post.course_title && (
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600">
                          <AcademicCapIcon className="h-4 w-4" />
                          <span className="font-semibold">{post.course_title}</span>
                        </div>
                      )}
                      {post.semester_name && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
                          <CalendarDaysIcon className="h-4 w-4" />
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

                {/* Content */}
                {post.content && (
                  <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 dark:border-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Enhanced Actions */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="font-medium">{formatNumber(solutions?.length || 0)} Solutions</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span className="font-medium">{formatNumber(post.download_count || 0)} Downloads</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <EyeIcon className="h-5 w-5" />
                      <span className="font-medium">{formatNumber(post.view_count || 0)} Views</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      post.is_saved 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 shadow-lg' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                    }`}
                    disabled={savePostMutation.isPending}
                  >
                    {post.is_saved ? (
                      <BookmarkSolidIcon className="h-5 w-5" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                    <span>{post.is_saved ? 'Saved' : 'Save Post'}</span>
                  </button>
                </div>
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
              <div className="mb-8 p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  ✨ Share Your Solution
                </h3>
                <textarea
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  placeholder="Share your solution, explanation, or insights that could help fellow students..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="6"
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowSolutionForm(false)}
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSolution}
                    disabled={addSolutionMutation.isPending || !newSolution.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                  >
                    {addSolutionMutation.isPending ? 'Publishing...' : 'Publish Solution'}
                  </button>
                </div>
              </div>
            )}

            {/* Solutions List */}
            {solutionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading solutions...</p>
              </div>
            ) : solutions && solutions.length > 0 ? (
              <div className="space-y-6">
                {solutions.map((solution, index) => (
                  <div
                    key={solution.id || index}
                    className={`border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                      solution.is_verified 
                        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/10' 
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Vote Section */}
                        <div className="flex flex-col items-center space-y-2">
                          <button
                            onClick={() => handleVoteSolution(solution.id, 1)}
                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              solution.user_vote === 1 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-400 dark:text-gray-500'
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
                            solution.user_vote === 1 ? 'text-emerald-600' : 
                            solution.user_vote === -1 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {formatNumber(solution.net_votes || 0)}
                          </span>
                          
                          <button
                            onClick={() => handleVoteSolution(solution.id, -1)}
                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              solution.user_vote === -1 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 dark:text-gray-500'
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
                                onClick={() => handleBookmarkSolution(solution.id)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  solution.is_bookmarked 
                                    ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300' 
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                disabled={!user}
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
                              <div className="flex items-center space-x-1">
                                <ChatBubbleLeftIcon className="h-4 w-4" />
                                <span className="font-medium">{solution.comment_count || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ChevronUpIcon className="h-4 w-4" />
                                <span className="font-medium">{formatNumber(solution.upvotes || 0)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ChevronDownIcon className="h-4 w-4" />
                                <span className="font-medium">{formatNumber(solution.downvotes || 0)}</span>
                              </div>
                            </div>
                            
                            {user && (
                              <button
                                onClick={() => toggleCommentForm(solution.id)}
                                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium"
                              >
                                <PlusIcon className="h-4 w-4" />
                                <span>Comment</span>
                              </button>
                            )}
                          </div>

                          {/* Add Comment Form */}
                          {showCommentForm[solution.id] && (
                            <div className="mt-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a thoughtful comment..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="3"
                              />
                              <div className="flex justify-end space-x-2 mt-3">
                                <button
                                  onClick={() => toggleCommentForm(solution.id)}
                                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAddComment(solution.id)}
                                  disabled={addCommentMutation.isPending || !newComment.trim()}
                                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Comments Section */}
                          {solution.comments && solution.comments.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Comments ({solution.comments.length})
                              </h4>
                              <div className="space-y-4">
                                {solution.comments.map((comment) => (
                                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                          <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                                          {comment.author_username}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatTimeAgo(comment.created_at)}
                                        </span>
                                        {comment.net_votes > 0 && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {comment.net_votes} votes
                                          </span>
                                        )}
                                      </div>
                                      {user && (
                                        <button
                                          onClick={() => handleReplyClick(comment.id)}
                                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                        >
                                          Reply
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {comment.content}
                                    </p>
                                    
                                    {/* Reply Form */}
                                    {replyTo === comment.id && (
                                      <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
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
                                            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleAddReply(solution.id, comment.id)}
                                            disabled={addCommentMutation.isPending || !replyText.trim()}
                                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                          >
                                            {addCommentMutation.isPending ? 'Replying...' : 'Reply'}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-3 ml-4 space-y-2">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="bg-gray-100 dark:bg-gray-600/50 p-3 rounded">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                <UserIcon className="h-2 w-2 text-gray-600 dark:text-gray-400" />
                                              </div>
                                              <span className="font-medium text-xs text-gray-900 dark:text-white">
                                                {reply.author_username}
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTimeAgo(reply.created_at)}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
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