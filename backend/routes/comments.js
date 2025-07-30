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

    // Create notification for the solution owner about new comment
    try {
      const pool = (await import('../config/db.js')).default;
      
      // Get solution owner and parent post information
      const solutionQuery = `
        SELECT s.student_id, p.post_id 
        FROM solutions s
        JOIN questions q ON s.question_id = q.question_id
        JOIN posts p ON q.question_id = p.question_id
        WHERE s.solution_id = $1
      `;
      const solutionResult = await pool.query(solutionQuery, [parseInt(solution_id)]);
      
      if (solutionResult.rows.length > 0) {
        const solutionOwnerId = solutionResult.rows[0].student_id;
        const postId = solutionResult.rows[0].post_id;
        
        // Don't notify if user comments on their own solution
        if (solutionOwnerId !== student_id) {
          // Import and create notification
          const Notification = (await import('../models/Notification.js')).default;
          await Notification.create({
            student_id: solutionOwnerId,
            notification_type: 'comment_added',
            message: 'Someone commented on your solution',
            reference_id: postId, // Store post ID for navigation
            reference_type: 'post' // Reference type is post for navigation
          });
        }
      }
    } catch (notificationError) {
      console.error('Error creating comment notification:', notificationError);
      // Don't fail the comment creation if notification fails
    }

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