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

// Hook to fetch detailed contribution data
export const useContributionData = () => {
  return useQuery({
    queryKey: ['contributionData'],
    queryFn: async () => {
      const response = await api.get('/auth/contribution');
      return response.data.contribution;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// User profile data hooks
export const useUserQuestions = (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'recent' } = options;
  
  return useQuery({
    queryKey: ['userQuestions', limit, offset, sortBy],
    queryFn: async () => {
      const response = await api.get('/auth/my-questions', {
        params: { limit, offset, sortBy }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUserSolutions = (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'recent' } = options;
  
  return useQuery({
    queryKey: ['userSolutions', limit, offset, sortBy],
    queryFn: async () => {
      const response = await api.get('/auth/my-solutions', {
        params: { limit, offset, sortBy }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUserBookmarks = (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  return useQuery({
    queryKey: ['userBookmarks', limit, offset],
    queryFn: async () => {
      const response = await api.get('/auth/my-bookmarks', {
        params: { limit, offset }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
