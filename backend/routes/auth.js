import express from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/logout - Logout (protected)
router.post('/logout', authMiddleware, authController.logout);

// GET /api/auth/admin/test - Test admin access (protected, admin only)
router.get('/admin/test', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ 
    message: 'Admin access granted',
    user: req.user 
  });
});

export default router;
