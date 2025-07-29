import pool from '../config/db.js';

class Report {
  // Create a new report
  static async createReport(reportData) {
    const client = await pool.connect();
    try {
      const { 
        studentId, 
        contentType, 
        contentId, 
        reason
      } = reportData;
      
      // Check if user has already reported this content
      const existingReportQuery = `
        SELECT report_id FROM reports 
        WHERE reporter_id = $1 AND content_type = $2 AND content_id = $3
      `;
      const existingReport = await client.query(existingReportQuery, [studentId, contentType, contentId]);
      
      if (existingReport.rows.length > 0) {
        throw new Error('You have already reported this content');
      }
      
      const insertQuery = `
        INSERT INTO reports (reporter_id, content_type, content_id, reason, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING report_id, content_type, content_id, reason, created_at
      `;
      
      const result = await client.query(insertQuery, [
        studentId, 
        contentType, 
        contentId, 
        reason
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Get all reports for admin moderation
  static async getAllReports(options = {}) {
    const client = await pool.connect();
    try {
      const { 
        status = 'pending', 
        contentType = null, 
        limit = 20, 
        offset = 0 
      } = options;
      
      let whereClause = 'WHERE r.status = $1';
      const queryParams = [status, limit, offset];
      let paramIndex = 4;
      
      if (contentType) {
        whereClause += ` AND r.content_type = $${paramIndex}`;
        queryParams.splice(3, 0, contentType);
        paramIndex++;
      }
      
      const query = `
        SELECT 
          r.report_id,
          r.content_type,
          r.content_id,
          r.reason,
          r.status,
          r.created_at,
          reporter.username as reporter_username,
          CASE 
            WHEN r.content_type = 'post' THEN q.title
            WHEN r.content_type = 'solution' THEN s.solution_title
            WHEN r.content_type = 'comment' THEN LEFT(c.comment_text, 100)
          END as content_title,
          CASE 
            WHEN r.content_type = 'post' THEN q_author.username
            WHEN r.content_type = 'solution' THEN s_author.username
            WHEN r.content_type = 'comment' THEN c_author.username
          END as content_author,
          CASE 
            WHEN r.content_type = 'post' THEN q.post_id
            WHEN r.content_type = 'solution' THEN sq.post_id
            WHEN r.content_type = 'comment' THEN cq.post_id
          END as post_id,
          COUNT(*) OVER() as total_count
        FROM reports r
        LEFT JOIN users reporter ON r.reporter_id = reporter.student_id
        LEFT JOIN posts q ON r.content_type = 'post' AND r.content_id = q.post_id
        LEFT JOIN users q_author ON q.student_id = q_author.student_id
        LEFT JOIN solutions s ON r.content_type = 'solution' AND r.content_id = s.solution_id
        LEFT JOIN users s_author ON s.student_id = s_author.student_id
        LEFT JOIN posts sq ON s.question_id = sq.question_id
        LEFT JOIN comments c ON r.content_type = 'comment' AND r.content_id = c.comment_id
        LEFT JOIN users c_author ON c.student_id = c_author.student_id
        LEFT JOIN solutions cs ON c.solution_id = cs.solution_id
        LEFT JOIN posts cq ON cs.question_id = cq.question_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;
      
      const result = await client.query(query, queryParams);
      
      return result.rows.map(row => ({
        ...row,
        createdAt: new Date(row.created_at).toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw new Error('Failed to fetch reports');
    } finally {
      client.release();
    }
  }
  
  // Get reports by content
  static async getReportsByContent(contentType, contentId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          r.report_id,
          r.reason,
          r.status,
          r.created_at,
          u.username as reporter_username
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.student_id
        WHERE r.content_type = $1 AND r.content_id = $2
        ORDER BY r.created_at DESC
      `;
      
      const result = await client.query(query, [contentType, contentId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching reports by content:', error);
      throw new Error('Failed to fetch reports');
    } finally {
      client.release();
    }
  }
  
  // Update report status
  static async updateReportStatus(reportId, status, adminNotes = null) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE reports 
        SET status = $1, admin_notes = $2, resolved_at = CASE WHEN $1 != 'pending' THEN NOW() ELSE NULL END
        WHERE report_id = $3
        RETURNING report_id, status, resolved_at
      `;
      
      const result = await client.query(query, [status, adminNotes, reportId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating report status:', error);
      throw new Error('Failed to update report status');
    } finally {
      client.release();
    }
  }
  
  // Get report statistics
  static async getReportStats() {
    const client = await pool.connect();
    try {
      const currentMonthQuery = `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
          COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_reports,
          COUNT(*) FILTER (WHERE content_type = 'post') as question_reports,
          COUNT(*) FILTER (WHERE content_type = 'solution') as solution_reports,
          COUNT(*) FILTER (WHERE content_type = 'comment') as comment_reports
        FROM reports
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `;

      const prevMonthQuery = `
        SELECT COUNT(*) as prev_month_reports
        FROM reports
        WHERE created_at >= NOW() - INTERVAL '60 days' 
        AND created_at < NOW() - INTERVAL '30 days'
      `;
      
      const [currentResult, prevResult] = await Promise.all([
        client.query(currentMonthQuery),
        client.query(prevMonthQuery)
      ]);

      const currentStats = currentResult.rows[0];
      const prevMonthReports = parseInt(prevResult.rows[0].prev_month_reports) || 0;
      const currentMonthReports = parseInt(currentStats.pending_reports) || 0;

      // Calculate growth percentage
      const growth = prevMonthReports > 0 
        ? Math.round(((currentMonthReports - prevMonthReports) / prevMonthReports) * 100)
        : currentMonthReports > 0 ? 100 : 0;

      return {
        ...currentStats,
        growth
      };
    } catch (error) {
      console.error('Error fetching report stats:', error);
      throw new Error('Failed to fetch report statistics');
    } finally {
      client.release();
    }
  }
  
  // Delete a report
  static async deleteReport(reportId) {
    const client = await pool.connect();
    try {
      const query = 'DELETE FROM reports WHERE report_id = $1 RETURNING report_id';
      const result = await client.query(query, [reportId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw new Error('Failed to delete report');
    } finally {
      client.release();
    }
  }
}

export default Report;
