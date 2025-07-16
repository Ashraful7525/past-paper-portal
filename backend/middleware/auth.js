// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = (req, res, next) => {
  const requestInfo = {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  };

  console.log('🔐 [AUTH] Starting authentication check:', requestInfo);

  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 [AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.error('❌ [AUTH] No token provided');
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('🔐 [AUTH] Token extracted, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'QV7OgvWxIrNSvfjdIZQEEAFQ5hb9mFGskyJTr8/FsUJ8wkwC2s2UJydzt2/aAWx/HxgbtEUdnYIpOcKgVwy81A==');
    
    console.log('✅ [AUTH] Token verified successfully:', {
      student_id: decoded.student_id,
      username: decoded.username,
      is_admin: decoded.is_admin,
      exp: new Date(decoded.exp * 1000).toISOString()
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Authentication failed:', {
      error: error.message,
      name: error.name,
      ...requestInfo
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    res.status(500).json({ 
      message: 'Token validation error' 
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!req.user.is_admin) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      message: 'Authorization error' 
    });
  }
};

// Optional: Middleware to check if user owns resource
export const resourceOwnershipMiddleware = (req, res, next) => {
  try {
    const { student_id } = req.user;
    const resourceOwnerId = req.params.student_id || req.body.student_id;
    
    if (req.user.is_admin || student_id == resourceOwnerId) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.' 
      });
    }
  } catch (error) {
    console.error('Resource ownership middleware error:', error);
    res.status(500).json({ 
      message: 'Authorization error' 
    });
  }
};

// Enhanced middleware with database verification (optional)
export const authWithDbVerification = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'QV7OgvWxIrNSvfjdIZQEEAFQ5hb9mFGskyJTr8/FsUJ8wkwC2s2UJydzt2/aAWx/HxgbtEUdnYIpOcKgVwy81A==');
    
    // Verify user still exists in database
    const user = await User.findById(decoded.student_id);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Token validation error' 
    });
  }
};