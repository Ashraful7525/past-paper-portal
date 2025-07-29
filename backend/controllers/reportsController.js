import Report from '../models/Report.js';

const reportsController = {
  // Submit a new report
  async submitReport(req, res) {
    try {
      const { contentType, contentId, reason } = req.body;
      const studentId = req.user.student_id;
      
      // Validate input
      if (!contentType || !contentId || !reason) {
        return res.status(400).json({ 
          error: 'Content type, content ID, and reason are required' 
        });
      }
      
      if (!['post', 'solution', 'comment'].includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type. Must be post, solution, or comment' 
        });
      }
      
      const reportData = {
        studentId,
        contentType,
        contentId: parseInt(contentId),
        reason
      };
      
      const report = await Report.createReport(reportData);
      
      res.status(201).json({
        message: 'Report submitted successfully',
        report
      });
    } catch (error) {
      if (error.message === 'You have already reported this content') {
        return res.status(409).json({ error: error.message });
      }
      
      console.error('Submit report error:', error);
      res.status(500).json({ error: 'Failed to submit report' });
    }
  },
  
  // Get reports by content (for showing report status to users)
  async getReportsByContent(req, res) {
    try {
      const { contentType, contentId } = req.params;
      
      if (!['question', 'solution', 'comment'].includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type' 
        });
      }
      
      const reports = await Report.getReportsByContent(contentType, parseInt(contentId));
      
      // Only return count and basic info to regular users
      res.json({
        reportCount: reports.length,
        hasReports: reports.length > 0
      });
    } catch (error) {
      console.error('Get reports by content error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },
  
  // Check if user has already reported content
  async checkUserReport(req, res) {
    try {
      const { contentType, contentId } = req.params;
      const studentId = req.user.student_id;
      
      if (!['question', 'solution', 'comment'].includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type' 
        });
      }
      
      // This would require a new method in Report model
      // For now, we'll return false (user hasn't reported)
      res.json({ hasReported: false });
    } catch (error) {
      console.error('Check user report error:', error);
      res.status(500).json({ error: 'Failed to check report status' });
    }
  }
};

export default reportsController;
