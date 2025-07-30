import Vote from '../models/Vote.js';
import Bookmark from '../models/Bookmark.js';

const solutionsController = {
  // Vote on solution
  async voteSolution(req, res) {
    const startTime = Date.now();
    console.log('🗳️  [VOTE SOLUTION] Starting vote process...');
    
    try {
      const { solution_id } = req.params;
      const { voteType } = req.body;
      const { student_id } = req.user;

      console.log('🗳️  [VOTE SOLUTION] Request details:', {
        solution_id,
        voteType,
        student_id,
        user: req.user ? `${req.user.username} (${req.user.student_id})` : 'No user',
        timestamp: new Date().toISOString()
      });

      // Validate user authentication
      if (!req.user || !student_id) {
        console.error('❌ [VOTE SOLUTION] Authentication failed - no user or student_id');
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      // Validate vote type
      if (![-1, 0, 1].includes(voteType)) {
        console.error('❌ [VOTE SOLUTION] Invalid vote type:', voteType);
        return res.status(400).json({ 
          message: 'Invalid vote type. Must be -1, 0, or 1' 
        });
      }

      // Validate solution_id
      if (!solution_id || isNaN(parseInt(solution_id))) {
        console.error('❌ [VOTE SOLUTION] Invalid solution ID:', solution_id);
        return res.status(400).json({ 
          message: 'Invalid solution ID' 
        });
      }

      console.log('✅ [VOTE SOLUTION] Validation passed, calling Vote.voteSolution...');

      const result = await Vote.voteSolution(parseInt(solution_id), student_id, voteType);
      
      // Create notification for vote (only for upvotes/downvotes, not for removing votes)
      if (voteType !== 0) {
        try {
          // Get solution owner
          const pool = (await import('../config/db.js')).default;
          const solutionQuery = `SELECT student_id FROM solutions WHERE solution_id = $1`;
          const solutionResult = await pool.query(solutionQuery, [parseInt(solution_id)]);
          
          if (solutionResult.rows.length > 0) {
            const solutionOwnerId = solutionResult.rows[0].student_id;
            
            // Import and create notification
            const Notification = (await import('../models/Notification.js')).default;
            await Notification.create({
              student_id: solutionOwnerId,
              notification_type: `solution_${voteType > 0 ? 'upvote' : 'downvote'}`,
              message: `Someone ${voteType > 0 ? 'upvoted' : 'downvoted'} your solution`,
              reference_id: parseInt(solution_id),
              reference_type: 'solution'
            });
          }
        } catch (notificationError) {
          console.error('Error creating solution vote notification:', notificationError);
          // Don't fail the vote if notification fails
        }
      }
      
      console.log('✅ [VOTE SOLUTION] Vote successful:', {
        solution_id: parseInt(solution_id),
        student_id,
        voteType,
        result,
        duration: `${Date.now() - startTime}ms`
      });

      res.json({ 
        success: true, 
        message: 'Vote recorded successfully',
        data: result 
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [VOTE SOLUTION] Error occurred:', {
        error: error.message,
        stack: error.stack,
        solution_id: req.params.solution_id,
        voteType: req.body.voteType,
        student_id: req.user?.student_id,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      // Log specific error types
      if (error.message.includes('does not exist')) {
        console.error('❌ [VOTE SOLUTION] Solution not found error');
        return res.status(404).json({ 
          message: 'Solution not found' 
        });
      }

      if (error.message.includes('Database query failed')) {
        console.error('❌ [VOTE SOLUTION] Database error');
        return res.status(500).json({ 
          message: 'Database error occurred',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      if (error.message.includes('connection')) {
        console.error('❌ [VOTE SOLUTION] Database connection error');
        return res.status(500).json({ 
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // Generic error response
      console.error('❌ [VOTE SOLUTION] Generic error response');
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Bookmark solution
  async bookmarkSolution(req, res) {
    try {
      const { solution_id } = req.params;
      const { student_id } = req.user;

      console.log('Bookmark solution request:', { solution_id, student_id });

      // Validate solution_id
      if (!solution_id || isNaN(parseInt(solution_id))) {
        return res.status(400).json({ 
          message: 'Invalid solution ID' 
        });
      }

      const result = await Bookmark.toggleBookmarkSolution(parseInt(solution_id), student_id);
      
      res.json({ 
        success: true, 
        message: result.isBookmarked ? 'Solution bookmarked successfully' : 'Solution unbookmarked successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error bookmarking solution:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({ 
          message: 'Solution not found' 
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default solutionsController;