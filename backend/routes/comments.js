import express from 'express';
import Comment from '../models/Comment.js';
import Vote from '../models/Vote.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Add comment to solution
router.post('/:solution_id/comments', authMiddleware, async (req, res) => {
  try {
    const { solution_id } = req.params;
    const { content, parent_comment_id } = req.body;
    const { student_id } = req.user;

    // Validate solution_id
    if (!solution_id || isNaN(parseInt(solution_id))) {
      return res.status(400).json({ 
        message: 'Invalid solution ID' 
      });
    }

    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ 
        message: 'Comment content is required' 
      });
    }

    const comment = await Comment.addComment(
      parseInt(solution_id), 
      student_id, 
      content.trim(), 
      parent_comment_id ? parseInt(parent_comment_id) : null
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        message: 'Solution or parent comment not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get comments for a solution
router.get('/:solution_id/comments', async (req, res) => {
  try {
    const { solution_id } = req.params;
    const student_id = req.user?.student_id || null;

    // Validate solution_id
    if (!solution_id || isNaN(parseInt(solution_id))) {
      return res.status(400).json({ 
        message: 'Invalid solution ID' 
      });
    }

    const comments = await Comment.getCommentsBySolutionId(parseInt(solution_id), student_id);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Vote on a comment
router.post('/:comment_id/vote', authMiddleware, async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { voteType } = req.body;
    const { student_id } = req.user;

    // Validate comment_id
    if (!comment_id || isNaN(parseInt(comment_id))) {
      return res.status(400).json({ 
        message: 'Invalid comment ID' 
      });
    }

    // Validate voteType (should be -1, 0, or 1)
    if (voteType !== -1 && voteType !== 0 && voteType !== 1) {
      return res.status(400).json({ 
        message: 'Invalid vote type. Must be -1, 0, or 1' 
      });
    }

    // Use Vote.js implementation for consistency
    const result = await Vote.voteComment(parseInt(comment_id), student_id, voteType);

    res.json({
      success: true,
      message: voteType === 0 ? 'Vote removed' : 'Vote recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error voting on comment:', error);
    
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;