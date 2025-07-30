import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useQuery } from '@tanstack/react-query';

export const useProfile = (user) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        setProfile(response.data);
        setNewProfileDescription(response.data.profile || '');
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/auth/profile', {
        profile: newProfileDescription,
      });
      setProfile(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  return {
    profile,
    stats,
    isEditing,
    setIsEditing,
    newProfileDescription,
    setNewProfileDescription,
    handleUpdateProfile,
    loading
  };
};

// User profile data hooks
export const useUserQuestions = (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'recent' } = options;
  
  return useQuery({
    queryKey: ['userQuestions', { limit, offset, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy
      });
      const response = await api.get(`/auth/my-questions?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserSolutions = (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'recent' } = options;
  
  return useQuery({
    queryKey: ['userSolutions', { limit, offset, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy
      });
      const response = await api.get(`/auth/my-solutions?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserBookmarks = (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'recent', type = 'all' } = options;
  
  return useQuery({
    queryKey: ['userBookmarks', { limit, offset, sortBy, type }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
        type
      });
      const response = await api.get(`/auth/my-bookmarks?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
