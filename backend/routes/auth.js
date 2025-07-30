import express from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/password', authMiddleware, authController.changePassword);
router.get('/stats', authMiddleware, authController.getUserStats);
router.post('/logout', authMiddleware, authController.logout);

// Profile picture routes - frontend upload approach
router.put('/profile-picture', authMiddleware, authController.updateProfilePictureUrl);
router.delete('/profile-picture', authMiddleware, authController.removeProfilePicture);

// User content routes for profile pages
router.get('/my-questions', authMiddleware, authController.getUserQuestions);
router.get('/my-solutions', authMiddleware, authController.getUserSolutions);
router.get('/my-bookmarks', authMiddleware, authController.getUserBookmarks);

// Contribution system routes
router.get('/contribution', authMiddleware, authController.getContributionData);
router.post('/recalculate-contribution', authMiddleware, authController.recalculateContribution);

// Notification routes
router.get('/notifications', authMiddleware, authController.getNotifications);
router.patch('/notifications/:notificationId/read', authMiddleware, authController.markNotificationAsRead);
router.patch('/notifications/read-all', authMiddleware, authController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', authMiddleware, authController.deleteNotification);
router.get('/notifications/solution/:solutionId/post', authMiddleware, authController.getPostFromSolution);
router.get('/notifications/comment/:commentId/post', authMiddleware, authController.getPostFromComment);

// Admin routes
router.get('/admin/test', authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: 'Admin access granted',
    user: req.user
  });
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const User = (await import('../models/User.js')).default;
    const users = await User.getAllUsers(parseInt(limit), parseInt(offset));
    res.json(users.map(user => user.toJSON()));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
