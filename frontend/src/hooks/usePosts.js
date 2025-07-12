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
    return {
      data: {
        posts: response.data.posts || []
      },
      pagination: response.data.pagination || { hasMore: false, page: pageParam }
    };
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
    onMutate: async ({ postId, voteType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ['posts'] });
      
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map(post => {
                if (post.post_id === postId) {
                  const currentVote = post.user_vote || 0;
                  const currentUpvotes = post.upvotes || 0;
                  const currentDownvotes = post.downvotes || 0;
                  
                  // Calculate new vote counts
                  let newUpvotes = currentUpvotes;
                  let newDownvotes = currentDownvotes;
                  
                  // Remove previous vote effect
                  if (currentVote === 1) newUpvotes -= 1;
                  if (currentVote === -1) newDownvotes -= 1;
                  
                  // Add new vote effect
                  if (voteType === 1) newUpvotes += 1;
                  if (voteType === -1) newDownvotes += 1;
                  
                  return {
                    ...post,
                    user_vote: voteType,
                    upvotes: newUpvotes,
                    downvotes: newDownvotes
                  };
                }
                return post;
              })
            }
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, { postId, voteType }, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.response?.data?.message || 'Failed to vote');
    },
    onSuccess: () => {
      toast.success('Vote recorded!');
    },
    onSettled: () => {
      // Refetch to ensure data is consistent
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId) => postsAPI.toggleSave(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ['posts'] });
      
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map(post => {
                if (post.post_id === postId) {
                  return {
                    ...post,
                    is_saved: !post.is_saved
                  };
                }
                return post;
              })
            }
          }))
        };
      });
      
      return { previousData };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.response?.data?.message || 'Failed to save');
    },
    onSuccess: (data) => {
      toast.success(data.data?.isSaved ? 'Post saved!' : 'Post unsaved!');
    },
    onSettled: () => {
      // Refetch to ensure data is consistent
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};
