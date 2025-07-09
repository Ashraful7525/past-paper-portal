console.log('✅ posts.js loaded');

import express from 'express';
import postsController from '../controllers/postsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/feed', postsController.getFeed);

// Protected routes (require authentication)
router.post('/:post_id/vote', authMiddleware, postsController.votePost);
router.post('/:post_id/save', authMiddleware, postsController.toggleSave);
router.post('/:post_id/view', postsController.trackView);

export default router;
