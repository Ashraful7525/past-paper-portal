import Question from '../models/Question.js';
import Solution from '../models/Solution.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Stats from '../models/Stats.js';
import Report from '../models/Report.js';

const adminController = {
  // Get pending questions for moderation
  async getPendingQuestions(req, res) {
    try {
      const { status = 'pending', limit = 20, offset = 0 } = req.query;
      const questions = await Question.getPendingQuestions(status, parseInt(limit), parseInt(offset));
      res.json(questions);
    } catch (error) {
      console.error('Get pending questions error:', error);
      res.status(500).json({ error: 'Failed to fetch pending questions' });
    }
  },

  // Get pending solutions for moderation
  async getPendingSolutions(req, res) {
    try {
      const { status = 'pending', limit = 20, offset = 0 } = req.query;
      const solutions = await Solution.getPendingSolutions(status, parseInt(limit), parseInt(offset));
      res.json(solutions);
    } catch (error) {
      console.error('Get pending solutions error:', error);
      res.status(500).json({ error: 'Failed to fetch pending solutions' });
    }
  },

  // Get flagged comments for moderation
  async getFlaggedComments(req, res) {
    try {
      const { status = 'flagged', limit = 20, offset = 0 } = req.query;
      const comments = await Comment.getFlaggedComments(status, parseInt(limit), parseInt(offset));
      res.json(comments);
    } catch (error) {
      console.error('Get flagged comments error:', error);
      res.status(500).json({ error: 'Failed to fetch flagged comments' });
    }
  },

  // Approve question
  async approveQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = await Question.approveQuestion(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json({ 
        message: 'Question approved successfully',
        question: result
      });
    } catch (error) {
      console.error('Approve question error:', error);
      res.status(500).json({ error: 'Failed to approve question' });
    }
  },

  // Approve solution
  async approveSolution(req, res) {
    try {
      const { id } = req.params;
      const result = await Solution.approveSolution(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Solution not found' });
      }
      
      res.json({ 
        message: 'Solution approved successfully',
        solution: result
      });
    } catch (error) {
      console.error('Approve solution error:', error);
      res.status(500).json({ error: 'Failed to approve solution' });
    }
  },

  // Approve comment (remove flag)
  async approveComment(req, res) {
    try {
      const { id } = req.params;
      const result = await Comment.approveComment(id);
      
      res.json({ 
        message: 'Comment approved successfully',
        comment: result
      });
    } catch (error) {
      console.error('Approve comment error:', error);
      res.status(500).json({ error: 'Failed to approve comment' });
    }
  },

  // Delete question
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = await Question.deleteQuestion(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  },

  // Delete solution
  async deleteSolution(req, res) {
    try {
      const { id } = req.params;
      const result = await Solution.deleteSolution(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Solution not found' });
      }
      
      res.json({ message: 'Solution deleted successfully' });
    } catch (error) {
      console.error('Delete solution error:', error);
      res.status(500).json({ error: 'Failed to delete solution' });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const result = await Comment.deleteComment(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  },

  // Get admin dashboard stats
  async getAdminStats(req, res) {
    try {
      const stats = await Stats.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const users = await User.findAll(parseInt(limit), parseInt(offset));
      res.json(users.map(user => user.toJSON()));
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Ban/unban user
  async toggleUserBan(req, res) {
    try {
      const { id } = req.params;
      const { banned } = req.body;
      const result = await User.toggleBan(id, banned);
      
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
        user: result
      });
    } catch (error) {
      console.error('Toggle user ban error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  },

  // Reports management
  async getAllReports(req, res) {
    try {
      const { status = 'pending', contentType, limit = 20, offset = 0 } = req.query;
      const options = {
        status,
        contentType,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
      
      const reports = await Report.getAllReports(options);
      res.json(reports);
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },

  async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      if (!['pending', 'resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be pending, resolved, or dismissed' 
        });
      }
      
      const result = await Report.updateReportStatus(id, status, adminNotes);
      
      if (!result) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      res.json({ 
        message: 'Report status updated successfully',
        report: result
      });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({ error: 'Failed to update report status' });
    }
  },

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const success = await Report.deleteReport(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  },

  async getReportStats(req, res) {
    try {
      const stats = await Report.getReportStats();
      res.json(stats);
    } catch (error) {
      console.error('Get report stats error:', error);
      res.status(500).json({ error: 'Failed to fetch report statistics' });
    }
  }
};

export default adminController;
