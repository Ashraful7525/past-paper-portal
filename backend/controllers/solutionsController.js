import Vote from '../models/Vote.js';
import Bookmark from '../models/Bookmark.js';

const solutionsController = {
  // Vote on solution
  async voteSolution(req, res) {
    try {
      const { solution_id } = req.params;
      const { voteType } = req.body;
      const { student_id } = req.user;

      console.log('Vote solution request:', { solution_id, voteType, student_id });

      // Validate vote type
      if (![-1, 0, 1].includes(voteType)) {
        return res.status(400).json({ 
          message: 'Invalid vote type. Must be -1, 0, or 1' 
        });
      }

      // Validate solution_id
      if (!solution_id || isNaN(parseInt(solution_id))) {
        return res.status(400).json({ 
          message: 'Invalid solution ID' 
        });
      }

      const result = await Vote.voteSolution(parseInt(solution_id), student_id, voteType);
      
      res.json({ 
        success: true, 
        message: 'Vote recorded successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error voting on solution:', error);
      
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