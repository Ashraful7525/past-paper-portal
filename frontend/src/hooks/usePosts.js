import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const postsAPI = {
  getFeed: async ({ pageParam = 1, ...filters }) => {
    const params = new URLSearchParams({
      page: pageParam,
      limit: 20,
      ...filters
    });
    
    const response = await fetch(`/api/posts/feed?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  },

  votePost: async (postId, voteType) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ vote_type: voteType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to vote');
    }
    return response.json();
  },

  toggleSave: async (postId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/posts/${postId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to save');
    }
    return response.json();
  }
};

export const usePosts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => postsAPI.getFeed({ pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialPageParam: 1
  });
};

export const useVotePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, voteType }) => postsAPI.votePost(postId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to vote');
    }
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId) => postsAPI.toggleSave(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(data.saved ? 'Post saved!' : 'Post unsaved!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save');
    }
  });
};
