import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Enhanced validation for registration
const validateRegistrationData = (userData) => {
  const errors = [];
  
  if (!userData.student_id || userData.student_id.toString().trim() === '') {
    errors.push('Student ID is required and cannot be empty');
  }
  
  if (!userData.username || userData.username.trim() === '') {
    errors.push('Username is required and cannot be empty');
  }
  
  if (!userData.email || userData.email.trim() === '') {
    errors.push('Email is required and cannot be empty');
  }
  
  if (!userData.password || userData.password.trim() === '') {
    errors.push('Password is required and cannot be empty');
  }
  
  // Additional password strength validation
  if (userData.password && userData.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
};

// API functions
const authAPI = {
  register: async (userData) => {
    // Validate data before sending
    const validationErrors = validateRegistrationData(userData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: parseInt(userData.student_id, 10), // Ensure it's converted to int
        username: userData.username?.trim(),
        email: userData.email?.trim().toLowerCase(),
        password: userData.password?.trim(),
        profile: userData.profile?.trim() || ''
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email?.trim().toLowerCase(),
        password: credentials.password?.trim()
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      localStorage.removeItem('token');
      return null;
    }
    
    const userData = await response.json();
    console.log('getCurrentUser fetched user:', userData);
    return { ...userData, is_admin: !!userData.is_admin };
  },

  getUserStats: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await fetch('/api/auth/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return response.json();
  },

  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    
    // Filter out null/empty values
    const cleanData = {};
    if (profileData.username && profileData.username.trim() !== '') {
      cleanData.username = profileData.username.trim();
    }
    if (profileData.email && profileData.email.trim() !== '') {
      cleanData.email = profileData.email.trim().toLowerCase();
    }
    if (profileData.profile !== undefined) {
      cleanData.profile = profileData.profile?.trim() || '';
    }

    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cleanData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Profile update failed');
    }
    
    return response.json();
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    localStorage.removeItem('token');
    return true;
  },
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: authAPI.getUserStats,
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      const userWithBooleanAdmin = { ...data.user, is_admin: !!data.user.is_admin };
      queryClient.setQueryData(['user'], userWithBooleanAdmin);
      console.log('Registered user data:', userWithBooleanAdmin);
      
      // Redirect based on role
      if (userWithBooleanAdmin.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      
      toast.success('Registration successful! Welcome to Past Paper Portal!');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      const userWithBooleanAdmin = { ...data.user, is_admin: !!data.user.is_admin };
      queryClient.setQueryData(['user'], userWithBooleanAdmin);
      console.log('Logged in user data:', userWithBooleanAdmin);
      
      // Redirect based on role
      if (userWithBooleanAdmin.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      
      toast.success('Login successful!');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Profile update failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.setQueryData(['userStats'], null);
      queryClient.clear();
      navigate('/');
      toast.success('Logged out successfully!');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      queryClient.setQueryData(['user'], null);
      queryClient.setQueryData(['userStats'], null);
      queryClient.clear();
      navigate('/');
      toast.success('Logged out successfully!');
    },
  });

  const register = (userData) => {
    const validationErrors = validateRegistrationData(userData);
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(', '));
      return;
    }
    registerMutation.mutate(userData);
  };

  const login = (credentials) => {
    loginMutation.mutate(credentials);
  };

  const updateProfile = (profileData) => {
    updateProfileMutation.mutate(profileData);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const value = {
    user,
    userStats,
    isLoading,
    error,
    register,
    login,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
