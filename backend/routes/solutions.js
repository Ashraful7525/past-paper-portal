import express from 'express';
import solutionsController from '../controllers/solutionsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Vote on solution
router.post('/:solution_id/vote', authMiddleware, solutionsController.voteSolution);

// Bookmark solution
router.post('/:solution_id/bookmark', authMiddleware, solutionsController.bookmarkSolution);

export default router;