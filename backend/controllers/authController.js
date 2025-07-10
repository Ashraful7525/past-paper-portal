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
  // Register new user
  async register(req, res) {
    try {
      const { student_id, username, email, password, profile } = req.body;

      // Validate input
      if (!student_id || !username || !email || !password) {
        return res.status(400).json({ 
          message: 'Student ID, username, email, and password are required' 
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

      const existingUserById = await User.findById(student_id);
      if (existingUserById) {
        return res.status(409).json({ 
          message: 'Student ID already registered' 
        });
      }

      // Create new user
      const newUser = await User.create({
        student_id,
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

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        });
      }

      // Find user by email
      console.log('ekhane');
      const user = await User.findByEmail(email);
      console.log('ekhane');
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }
      console.log(user.student_id);
      // Validate password
      const isPasswordValid = await user.validatePassword(password);

      console.log('validate hoyse');
      console.log(user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }
      console.log('validate hoyse');
      const token = generateToken(user);
      console.log('ekhane');
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

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { is_admin } = req.user;
      
      if (!is_admin) {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const users = await User.findAll(limit, offset);
      const totalUsers = await User.count();
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        users: users.map(user => user.toJSON()),
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_users: totalUsers,
          per_page: limit
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  },

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { is_admin } = req.user;
      const { student_id } = req.params;
      
      if (!is_admin) {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      const user = await User.findById(student_id);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      await user.delete();

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      // In a real application, you might invalidate the token here
      // For now, we'll just send a success response
      res.json({ 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Internal server error' 
      });
    }
  }
};

export default authController;