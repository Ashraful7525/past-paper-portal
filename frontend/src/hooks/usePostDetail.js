import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useRef, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export const usePostDetail = (postId) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viewTrackedRef = useRef(new Set()); // Track which posts have been viewed
  const viewTimeoutRef = useRef(null);

  // Fetch post details
  const {
    data: post,
    isLoading: postLoading,
    error: postError
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });

  // Fetch solutions separately
  const {
    data: solutions = [],
    isLoading: solutionsLoading,
    error: solutionsError
  } = useQuery({
    queryKey: ['solutions', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/solutions`);
      return response.data;
    },
    enabled: !!postId,
  });

  // Vote post mutation
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

  // Save post mutation
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
    mutationFn: async ({ content, file_url }) => {
      const response = await api.post(`/posts/${postId}/solutions`, { content, file_url });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      toast.success('Solution added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add solution');
    },
  });

  // Vote solution mutation
  const voteSolutionMutation = useMutation({
    mutationFn: async ({ solutionId, voteType }) => {
      console.log('🗳️  [FRONTEND] Starting solution vote request:', {
        solutionId,
        voteType,
        user: user?.username,
        student_id: user?.student_id,
        timestamp: new Date().toISOString()
      });

      try {
        const response = await api.post(`/solutions/${solutionId}/vote`, { voteType });
        console.log('✅ [FRONTEND] Vote request successful:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [FRONTEND] Vote request failed:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          solutionId,
          voteType,
          user: user?.username
        });
        throw error;
      }
    },
    onSuccess: (data, { solutionId, voteType }) => {
      console.log('✅ [FRONTEND] Vote mutation successful:', {
        solutionId,
        voteType,
        result: data,
        user: user?.username
      });
      
      // Invalidate queries to refetch fresh data from server
      queryClient.invalidateQueries(['solutions', postId]);
      toast.success('Vote recorded!');
    },
    onError: (error, { solutionId, voteType }) => {
      console.error('❌ [FRONTEND] Vote mutation failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        solutionId,
        voteType,
        user: user?.username,
        timestamp: new Date().toISOString()
      });

      // Show detailed error message
      const errorMessage = error.response?.data?.message || 'Failed to vote on solution';
      toast.error(errorMessage);
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
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  // Vote comment mutation
  const voteCommentMutation = useMutation({
    mutationFn: async ({ commentId, voteType }) => {
      const response = await api.post(`/comments/${commentId}/vote`, { voteType });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solutions', postId]);
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to vote on comment');
    },
  });

  // Track view mutation with better error handling
  const trackViewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/posts/${postId}/view`);
      return response.data;
    },
    onError: (error) => {
      console.error('Failed to track view:', error);
    },
  });

  // Debounced view tracking to prevent multiple requests
  const handleTrackView = useCallback(() => {
    if (!postId || !post) return;
    
    // Check if this post has already been tracked in this session
    if (viewTrackedRef.current.has(postId)) {
      return;
    }
    
    // Clear any existing timeout
    if (viewTimeoutRef.current) {
      clearTimeout(viewTimeoutRef.current);
    }
    
    // Set a debounced timeout to track the view
    viewTimeoutRef.current = setTimeout(() => {
      // Mark as tracked to prevent duplicate requests
      viewTrackedRef.current.add(postId);
      
      // Only track if mutation is not already pending
      if (!trackViewMutation.isPending) {
        trackViewMutation.mutate();
      }
    }, 1000); // 1 second debounce
  }, [postId, post, trackViewMutation]);

  // Helper functions
  const handleVotePost = (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    votePostMutation.mutate({ voteType });
  };

  const handleSavePost = () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }
    savePostMutation.mutate();
  };

  const handleAddSolution = async (solutionText, file) => {
    if (!user) {
      toast.error('Please login to add solutions');
      return;
    }
    if (!solutionText.trim()) {
      toast.error('Solution cannot be empty');
      return;
    }
    let file_url = null;
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('solutions').upload(fileName, file);
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('solutions').getPublicUrl(fileName);
        file_url = publicUrlData.publicUrl;
      } catch (err) {
        toast.error('File upload failed: ' + (err.message || err.error_description || 'Unknown error'));
        return;
      }
    }
    // FIX: Send content and file_url as separate fields
    addSolutionMutation.mutate({ content: solutionText, file_url });
  };

  const handleVoteSolution = (solutionId, voteType) => {
    if (!user) {
      toast.error('Please login to vote on solutions');
      return;
    }
    voteSolutionMutation.mutate({ solutionId, voteType });
  };

  const handleBookmarkSolution = (solutionId) => {
    if (!user) {
      toast.error('Please login to bookmark solutions');
      return;
    }
    bookmarkSolutionMutation.mutate(solutionId);
  };

  const handleAddComment = (solutionId, content, parentCommentId = null) => {
    if (!user) {
      toast.error('Please login to add comments');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    addCommentMutation.mutate({ solutionId, content: content.trim(), parentCommentId });
  };

  const handleVoteComment = (solutionId, commentId, voteType) => {
    if (!user) {
      toast.error('Please login to vote on comments');
      return;
    }
    voteCommentMutation.mutate({ commentId, voteType });
  };

  return {
    // Data
    post,
    solutions,
    user,
    
    // Loading states
    isLoading: postLoading || solutionsLoading,
    postLoading,
    solutionsLoading,
    
    // Error states
    postError,
    solutionsError,
    
    // Mutation loading states
    isVotingPost: votePostMutation.isPending,
    isSavingPost: savePostMutation.isPending,
    isAddingSolution: addSolutionMutation.isPending,
    isVotingSolution: voteSolutionMutation.isPending,
    isBookmarkingSolution: bookmarkSolutionMutation.isPending,
    isAddingComment: addCommentMutation.isPending,
    isVotingComment: voteCommentMutation.isPending,
    
    // Actions
    handleVotePost,
    handleSavePost,
    handleAddSolution,
    handleVoteSolution,
    handleBookmarkSolution,
    handleAddComment,
    handleVoteComment,
    handleTrackView,
  };
};
