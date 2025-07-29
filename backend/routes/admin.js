import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Moderation routes
router.get('/questions', adminController.getPendingQuestions);
router.get('/solutions', adminController.getPendingSolutions);
router.get('/comments', adminController.getFlaggedComments);

// Approval routes
router.put('/questions/:id/approve', adminController.approveQuestion);
router.put('/solutions/:id/approve', adminController.approveSolution);
router.put('/comments/:id/approve', adminController.approveComment);

// Delete routes
router.delete('/questions/:id', adminController.deleteQuestion);
router.delete('/solutions/:id', adminController.deleteSolution);
router.delete('/comments/:id', adminController.deleteComment);

// Admin dashboard stats
router.get('/stats', adminController.getAdminStats);

// New dashboard data routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/activity', adminController.getRecentActivity);
router.get('/dashboard/pending-actions', adminController.getPendingActions);
router.get('/dashboard/system-health', adminController.getSystemHealth);

// User management routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.toggleUserBan);

// Reports management routes
router.get('/reports', adminController.getAllReports);
router.put('/reports/:id', adminController.updateReportStatus);
router.delete('/reports/:id', adminController.deleteReport);
router.get('/reports/stats', adminController.getReportStats);

export default router;
