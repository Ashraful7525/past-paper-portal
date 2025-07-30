import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      student_id: user.student_id,
      email: user.email,
      is_admin: user.is_admin
    },
    process.env.JWT_SECRET || 'QV7OgvWxIrNSvfjdIZQEEAFQ5hb9mFGskyJTr8/FsUJ8wkwC2s2UJydzt2/aAWx/HxgbtEUdnYIpOcKgVwy81A==',
    { expiresIn: '7d' }
  );
};

const authController = {
  // Register new user - UPDATED
  async register(req, res) {
    try {
      const { student_id, username, email, password, profile } = req.body;

      // Validate input - student_id is now required from frontend
      if (!student_id || !username || !email || !password) {
        return res.status(400).json({
          message: 'Student ID, username, email, and password are required'
        });
      }

      // Validate student_id is a valid integer
      const parsedStudentId = parseInt(student_id, 10);
      if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
        return res.status(400).json({
          message: 'Student ID must be a valid positive number'
        });
      }

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          message: 'User with this email already exists'
        });
      }

      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          message: 'Username already taken'
        });
      }

      const existingUserById = await User.findById(parsedStudentId);
      if (existingUserById) {
        return res.status(409).json({
          message: 'Student ID already registered'
        });
      }

      // Create new user with frontend-provided student_id
      const newUser = await User.create({
        student_id: parsedStudentId, // Use the parsed student_id from frontend
        username,
        email,
        password,
        profile: profile || ''
      });

      const token = generateToken(newUser);

      res.status(201).json({
        token,
        user: newUser.toJSON(),
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Email already exists' ||
          error.message === 'Username already exists' ||
          error.message === 'Student ID already exists') {
        return res.status(409).json({
          message: error.message
        });
      }

      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Login - CLEANED UP
  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log('ami ki pagol hoye zbo');
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user);
      
      res.json({
        token,
        user: user.toJSON(),
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const { student_id } = req.user;
      const user = await User.findById(student_id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(user.toJSON());
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Get user statistics - ADDED
  async getUserStats(req, res) {
    try {
      const { student_id } = req.user;
      
      const user = await User.findById(student_id);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Return mock stats for now (you can implement real stats later)
      const stats = {
        questionsCount: 0,
        solutionsCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        contribution: user.contribution || 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        message: 'Internal server error while fetching user statistics' 
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { student_id } = req.user;
      const { username, profile } = req.body;

      const user = await User.findById(student_id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Check if username is already taken by another user
      if (username && username !== user.username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.student_id !== student_id) {
          return res.status(409).json({
            message: 'Username already taken'
          });
        }
        user.username = username;
      }

      if (profile !== undefined) {
        user.profile = profile;
      }

      await user.save();

      res.json({
        user: user.toJSON(),
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { student_id } = req.user;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'New password must be at least 6 characters long'
        });
      }

      const user = await User.findById(student_id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Validate current password
      const isCurrentPasswordValid = await user.validatePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.updatePassword(newPassword);

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Update profile picture URL (after frontend upload)
  async updateProfilePictureUrl(req, res) {
    try {
      const { student_id } = req.user;
      const { profile_picture_url, profile_picture_filename } = req.body;

      if (!profile_picture_url || !profile_picture_filename) {
        return res.status(400).json({
          message: 'Profile picture URL and filename are required'
        });
      }

      const updatedUser = await User.updateProfilePicture(student_id, {
        profile_picture_url,
        profile_picture_filename
      });

      if (!updatedUser) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile picture updated successfully',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Update profile picture URL error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Remove profile picture
  async removeProfilePicture(req, res) {
    try {
      const { student_id } = req.user;
      
      const updatedUser = await User.removeProfilePicture(student_id);

      if (!updatedUser) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile picture removed successfully',
        user: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Remove profile picture error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Get user's questions (posts)
  async getUserQuestions(req, res) {
    try {
      const { student_id } = req.user;
      const { limit = 20, offset = 0, sortBy = 'recent' } = req.query;

      const Post = (await import('../models/Post.js')).default;
      const posts = await Post.getFeedPosts({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        student_id,
        filterByAuthor: true // Filter to only show posts by this user
      });

      res.json({
        posts: posts.filter(post => post.student_id === student_id),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: posts.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user questions error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Get user's solutions
  async getUserSolutions(req, res) {
    try {
      const { student_id } = req.user;
      const { limit = 20, offset = 0, sortBy = 'recent' } = req.query;

      const Solution = (await import('../models/Solution.js')).default;
      const solutions = await Solution.getSolutionsByStudentId(student_id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy
      });

      res.json({
        solutions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: solutions.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user solutions error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  // Get user's bookmarks (saved posts and bookmarked solutions)
  async getUserBookmarks(req, res) {
    try {
      const { student_id } = req.user;
      const { limit = 20, offset = 0, sortBy = 'recent', type = 'all' } = req.query;

      const Bookmark = (await import('../models/Bookmark.js')).default;
      
      let savedPosts = [];
      let bookmarkedSolutions = [];

      if (type === 'all' || type === 'posts') {
        savedPosts = await Bookmark.getSavedPosts(student_id, {
          limit: type === 'posts' ? parseInt(limit) : Math.ceil(parseInt(limit) / 2),
          offset: parseInt(offset),
          sortBy
        });
      }

      if (type === 'all' || type === 'solutions') {
        bookmarkedSolutions = await Bookmark.getBookmarkedSolutions(student_id, {
          limit: type === 'solutions' ? parseInt(limit) : Math.ceil(parseInt(limit) / 2),
          offset: parseInt(offset),
          sortBy
        });
      }

      res.json({
        savedPosts,
        bookmarkedSolutions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (savedPosts.length + bookmarkedSolutions.length) === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user bookmarks error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  }
};

export default authController;
