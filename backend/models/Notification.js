import pool from '../config/db.js';

class Notification {
  constructor(data) {
    this.notification_id = data.notification_id;
    this.student_id = data.student_id;
    this.message = data.message;
    this.is_read = data.is_read;
    this.created_at = data.created_at;
    this.notification_type = data.notification_type;
    this.reference_id = data.reference_id;
    this.reference_type = data.reference_type;
  }

  // Create a new notification
  static async create(notificationData) {
    const {
      student_id,
      notification_type = 'general',
      message,
      reference_id = null,
      reference_type = null
    } = notificationData;

    const query = `
      INSERT INTO notifications (student_id, notification_type, message, reference_id, reference_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [student_id, notification_type, message, reference_id, reference_type];
    const result = await pool.query(query, values);
    return new Notification(result.rows[0]);
  }

  // Get user notifications with pagination
  static async getUserNotifications(studentId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM notifications
      WHERE student_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [studentId, limit, offset]);
    return result.rows.map(row => new Notification(row));
  }

  // Get unread count for user
  static async getUnreadCount(studentId) {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE student_id = $1 AND is_read = false
    `;

    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0].count);
  }

  // Mark notification as read
  static async markAsRead(notificationId, studentId) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE notification_id = $1 AND student_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId, studentId]);
    return result.rows[0] ? new Notification(result.rows[0]) : null;
  }

  // Mark all notifications as read for user
  static async markAllAsRead(studentId) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE student_id = $1 AND is_read = false
    `;

    const result = await pool.query(query, [studentId]);
    return result.rowCount;
  }

  // Delete notification
  static async delete(notificationId, studentId) {
    const query = `
      DELETE FROM notifications
      WHERE notification_id = $1 AND student_id = $2
      RETURNING notification_id
    `;

    const result = await pool.query(query, [notificationId, studentId]);
    return result.rows.length > 0;
  }

  // Helper method to create vote notifications
  static async createVoteNotification(postOwnerId, voterUserId, postId, voteType, postType = 'post') {
    // Don't notify if user votes on their own content
    if (postOwnerId === voterUserId) return null;

    const action = voteType > 0 ? 'upvoted' : 'downvoted';
    const message = `Someone ${action} your ${postType}`;
    const notificationType = `${postType}_${voteType > 0 ? 'upvote' : 'downvote'}`;

    return await this.create({
      student_id: postOwnerId,
      notification_type: notificationType,
      message,
      reference_id: postId,
      reference_type: postType
    });
  }

  // Helper method to create solution notifications
  static async createSolutionNotification(postOwnerId, solutionAuthorId, postId, solutionId) {
    // Don't notify if user answers their own question
    if (postOwnerId === solutionAuthorId) return null;

    const message = 'Your question received a new answer';

    return await this.create({
      student_id: postOwnerId,
      notification_type: 'question_answer',
      message,
      reference_id: postId,
      reference_type: 'post'
    });
  }

  // Helper method to create comment notifications
  static async createCommentNotification(contentOwnerId, commenterId, contentId, contentType = 'solution') {
    // Don't notify if user comments on their own content
    if (contentOwnerId === commenterId) return null;

    const message = `Someone commented on your ${contentType}`;

    return await this.create({
      student_id: contentOwnerId,
      notification_type: 'comment_added',
      message,
      reference_id: contentId,
      reference_type: contentType
    });
  }

  // Helper method to create verification notifications
  static async createVerificationNotification(contentOwnerId, contentId, contentType = 'post') {
    const message = `Your ${contentType} has been verified by a moderator`;

    return await this.create({
      student_id: contentOwnerId,
      notification_type: 'content_verified',
      message,
      reference_id: contentId,
      reference_type: contentType
    });
  }

  // Helper method to get post ID from comment ID
  static async getPostIdFromComment(commentId) {
    try {
      const query = `
        SELECT p.post_id
        FROM comments c
        JOIN solutions s ON c.solution_id = s.solution_id
        JOIN questions q ON s.question_id = q.question_id
        JOIN posts p ON q.question_id = p.question_id
        WHERE c.comment_id = $1
      `;
      
      const result = await pool.query(query, [commentId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].post_id;
    } catch (error) {
      console.error('Error getting post ID from comment:', error);
      return null;
    }
  }

  // Enhanced toJSON method that resolves comment to post
  async toJSONWithPost() {
    const baseJSON = this.toJSON();
    
    // If this is a comment notification, try to resolve the post ID
    if (this.notification_type === 'comment_added' && this.reference_type === 'comment') {
      const postId = await Notification.getPostIdFromComment(this.reference_id);
      if (postId) {
        baseJSON.related_post_id = postId;
        baseJSON.navigation_url = `/post/${postId}`;
      }
    }
    
    return baseJSON;
  }

  toJSON() {
    return {
      id: this.notification_id,
      type: this.notification_type,
      title: this.getTitle(),
      message: this.message,
      is_read: this.is_read,
      related_post_id: this.reference_type === 'post' ? this.reference_id : null,
      related_solution_id: this.reference_type === 'solution' ? this.reference_id : null,
      related_comment_id: this.reference_type === 'comment' ? this.reference_id : null,
      created_at: this.created_at,
      navigation_url: this.getNavigationUrl()
    };
  }

  // Generate title based on notification type
  getTitle() {
    switch (this.notification_type) {
      case 'post_upvote':
        return 'Post upvoted';
      case 'post_downvote':
        return 'Post feedback';
      case 'solution_upvote':
        return 'Solution upvoted';
      case 'solution_downvote':
        return 'Solution feedback';
      case 'question_answer':
        return 'New answer received';
      case 'comment_added':
        return 'New comment';
      case 'content_verified':
        return 'Content verified';
      default:
        return 'Notification';
    }
  }

  // Generate navigation URL based on notification type and reference
  getNavigationUrl() {
    switch (this.notification_type) {
      case 'post_upvote':
      case 'post_downvote':
      case 'question_answer':
        // Navigate to the post detail page
        return `/post/${this.reference_id}`;
      
      case 'solution_upvote':
      case 'solution_downvote':
        // For solution notifications, we need to resolve the post ID
        // The frontend will handle this with the special endpoint
        return `/solution/${this.reference_id}`;
      
      case 'comment_added':
        // Navigate based on what was commented on
        if (this.reference_type === 'post') {
          return `/post/${this.reference_id}`;
        } else if (this.reference_type === 'solution') {
          return `/solution/${this.reference_id}`;
        } else if (this.reference_type === 'comment') {
          // For comment references, we need to find the post that contains this comment
          // This will be handled asynchronously, so return null for now
          // The frontend will use the comment ID for highlighting
          return null;
        }
        return null;
      
      case 'content_verified':
        // Navigate to the verified content
        if (this.reference_type === 'post') {
          return `/post/${this.reference_id}`;
        } else if (this.reference_type === 'solution') {
          return `/solution/${this.reference_id}`;
        }
        return null;
      
      default:
        return null;
    }
  }

  // Helper method to get post ID from solution ID - now async
  static async getPostIdFromSolution(solutionId) {
    try {
      const query = `
        SELECT p.post_id, p.title
        FROM solutions s
        JOIN questions q ON s.question_id = q.question_id
        JOIN posts p ON q.question_id = p.question_id
        WHERE s.solution_id = $1
      `;
      
      const result = await pool.query(query, [solutionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        post_id: result.rows[0].post_id,
        post_title: result.rows[0].title
      };
    } catch (error) {
      console.error('Error getting post ID from solution:', error);
      return null;
    }
  }
}

export default Notification;