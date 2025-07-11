console.log('✅ posts.js routes loaded');

import express from 'express';
import postsController from '../controllers/postsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authOptionalMiddleware } from '../middleware/authOptional.js';

const router = express.Router();

// Public routes
router.get('/feed', authOptionalMiddleware, postsController.getFeed);
router.get('/departments', postsController.getDepartments);
router.get('/stats', postsController.getStats);

// Individual post routes
router.get('/:post_id', authOptionalMiddleware, postsController.getPost);
router.get('/:post_id/solutions', postsController.getSolutions);

// Semi-protected routes (track views for anyone)
router.post('/:post_id/view', postsController.trackView);

// Protected routes (require authentication)
router.post('/:post_id/vote', authMiddleware, postsController.votePost);
router.post('/:post_id/save', authMiddleware, postsController.toggleSave);
router.post('/:post_id/solutions', authMiddleware, postsController.addSolution);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Posts router error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;