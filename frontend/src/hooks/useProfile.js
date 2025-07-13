import { useState, useEffect } from 'react';
import { api } from '../utils/api';

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
