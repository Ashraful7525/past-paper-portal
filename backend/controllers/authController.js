import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (user) => {
  return jwt.sign(
    { 
      student_id: user.student_id,
      email: user.email,
      is_admin: user.is_admin 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Demo users for testing
const demoUsers = [
  {
    student_id: 1,
    email: 'admin@example.com',
    username: 'admin',
    password: '123',
    is_admin: true,
    profile: 'System Administrator',
    contribution: 500,
    created_at: new Date('2024-01-01'),
    updated_at: new Date()
  },
  {
    student_id: 2,
    email: 'user@example.com',
    username: 'john_doe',
    password: '123',
    is_admin: false,
    profile: 'Computer Science Student',
    contribution: 156,
    created_at: new Date('2024-02-01'),
    updated_at: new Date()
  }
];

const authController = {
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

      const user = demoUsers.find(u => u.email === email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      const token = generateToken(user);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        token,
        user: userWithoutPassword,
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
      
      const user = demoUsers.find(u => u.student_id === student_id);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
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
