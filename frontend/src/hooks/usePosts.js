import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';

const postsAPI = {
  getFeed: async ({ pageParam = 1, ...filters }) => {
    const params = new URLSearchParams({
      page: pageParam,
      limit: 20,
      ...filters
    });
    
    const response = await api.get(`/posts/feed?${params}`);
    return response.data;
  },

  votePost: async (postId, voteType) => {
    const response = await api.post(`/posts/${postId}/vote`, { voteType });
    return response.data;
  },

  toggleSave: async (postId) => {
    const response = await api.post(`/posts/${postId}/save`);
    return response.data;
  }
};

export const usePosts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => postsAPI.getFeed({ pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined;
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
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId) => postsAPI.toggleSave(postId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(data.data?.isSaved ? 'Post saved!' : 'Post unsaved!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  });
};
