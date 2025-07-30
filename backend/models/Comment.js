import pool from '../config/db.js';
import ContributionManager from './ContributionManager.js';

class Comment {
  // Get flagged comments for admin moderation
  static async getFlaggedComments(status = 'flagged', limit = 20, offset = 0) {
    const client = await pool.connect();
    try {
      // For now, we'll return comments with negative net votes as "flagged"
      // In a real implementation, you'd have a flags table
      const query = `
        SELECT 
          c.comment_id as id,
          c.comment_text as content,
          c.upvotes,
          c.downvotes,
          c.created_at,
          u.username as author,
          q.question_title as solutionTitle,
          (c.downvotes - c.upvotes) as flagCount,
          'Inappropriate content' as flagReason
        FROM public.comments c
        LEFT JOIN public.users u ON c.student_id = u.student_id
        LEFT JOIN public.solutions s ON c.solution_id = s.solution_id
        LEFT JOIN public.questions q ON s.question_id = q.question_id
        WHERE (c.downvotes - c.upvotes) > 2
        ORDER BY (c.downvotes - c.upvotes) DESC, c.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await client.query(query, [limit, offset]);
      
      return result.rows.map(row => ({
        ...row,
        createdAt: new Date(row.created_at).toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error fetching flagged comments:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Approve comment (remove flag)
  static async approveComment(commentId) {
    // In a real implementation, you'd update a flags table
    // For now, we'll just return success
    return { id: commentId, approved: true };
  }

  // Delete a comment and all related data
  static async deleteComment(commentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete related data first
      await client.query('DELETE FROM public.comment_votes WHERE comment_id = $1', [commentId]);
      
      // Delete child comments first
      await client.query('DELETE FROM public.comments WHERE parent_comment_id = $1', [commentId]);
      
      // Delete the comment
      const result = await client.query(
        'DELETE FROM public.comments WHERE comment_id = $1 RETURNING comment_id',
        [commentId]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting comment:', error);
      throw new Error('Database delete failed');
    } finally {
      client.release();
    }
  }

  static async getCommentsBySolutionId(solutionId, studentId = null) {
    const client = await pool.connect();
    try {
      // Build user-specific joins and selects for comment votes
      let userVoteJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let groupByUserColumns = '';
      
      const queryParams = [solutionId];
      let paramIndex = 2;
      
      if (studentId) {
        userVoteJoin = `LEFT JOIN public.comment_votes cv ON c.comment_id = cv.comment_id AND cv.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(cv.vote_type, 0) as user_vote,`;
        groupByUserColumns = ', cv.vote_type';
        queryParams.push(studentId);
        paramIndex++;
      }

      // Get all comments for this solution (both parent and child comments)
      const query = `
        SELECT 
          c.comment_id,
          c.comment_text,
          c.parent_comment_id,
          c.upvotes,
          c.downvotes,
          c.created_at,
          c.updated_at,
          u.username as author_username,
          u.student_id as author_id,
          u.contribution as author_contribution,
          u.profile_picture_url as author_profile_picture,
          ${userVoteSelect}
          COUNT(DISTINCT replies.comment_id) as reply_count
        FROM public.comments c
        LEFT JOIN public.users u ON c.student_id = u.student_id
        LEFT JOIN public.comments replies ON c.comment_id = replies.parent_comment_id
        ${userVoteJoin}
        WHERE c.solution_id = $1
        GROUP BY c.comment_id, c.comment_text, c.parent_comment_id, c.upvotes, c.downvotes, c.created_at, c.updated_at, u.username, u.student_id, u.contribution, u.profile_picture_url${groupByUserColumns}
        ORDER BY c.parent_comment_id NULLS FIRST, c.created_at ASC
      `;

      const result = await client.query(query, queryParams);
      
      // Organize comments into parent-child structure with consistent field names
      const commentsMap = new Map();
      const parentComments = [];
      
      result.rows.forEach(comment => {
        const formattedComment = {
          comment_id: comment.comment_id,
          id: comment.comment_id, // For compatibility
          comment_text: comment.comment_text,
          content: comment.comment_text, // For compatibility
          parent_comment_id: comment.parent_comment_id,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          net_votes: comment.upvotes - comment.downvotes,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author_username: comment.author_username,
          author_id: comment.author_id,
          author_contribution: comment.author_contribution,
          author_profile_picture: comment.author_profile_picture,
          user_vote: comment.user_vote,
          reply_count: comment.reply_count,
          replies: []
        };
        
        commentsMap.set(comment.comment_id, formattedComment);
        
        if (comment.parent_comment_id === null) {
          parentComments.push(formattedComment);
        }
      });
      
      // Add replies to their parent comments
      result.rows.forEach(comment => {
        if (comment.parent_comment_id !== null) {
          const parentComment = commentsMap.get(comment.parent_comment_id);
          if (parentComment) {
            parentComment.replies.push(commentsMap.get(comment.comment_id));
          }
        }
      });
      
      return parentComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async addComment(solutionId, studentId, content, parentCommentId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify the solution exists
      const solutionQuery = 'SELECT solution_id FROM public.solutions WHERE solution_id = $1';
      const solutionResult = await client.query(solutionQuery, [solutionId]);
      
      if (solutionResult.rows.length === 0) {
        throw new Error('Solution does not exist');
      }

      // If it's a reply, verify the parent comment exists
      if (parentCommentId) {
        const parentQuery = 'SELECT comment_id FROM public.comments WHERE comment_id = $1 AND solution_id = $2';
        const parentResult = await client.query(parentQuery, [parentCommentId, solutionId]);
        
        if (parentResult.rows.length === 0) {
          throw new Error('Parent comment does not exist');
        }
      }

      // Insert the comment
      const insertQuery = `
        INSERT INTO public.comments (solution_id, student_id, comment_text, parent_comment_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING comment_id, comment_text, parent_comment_id, created_at, updated_at
      `;
      
      const insertResult = await client.query(insertQuery, [solutionId, studentId, content, parentCommentId]);
      
      // Award contribution points for creating a comment
      await ContributionManager.awardContentCreationPoints(
        studentId, 
        'comment', 
        false, // isVerified
        false, // isApproved 
        false, // isFeatured
        client
      );

      // Get the author username
      const userQuery = 'SELECT username FROM public.users WHERE student_id = $1';
      const userResult = await client.query(userQuery, [studentId]);
      
      const comment = {
        ...insertResult.rows[0],
        id: insertResult.rows[0].comment_id,
        content: insertResult.rows[0].comment_text,
        author_username: userResult.rows[0]?.username || 'Unknown',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
        user_vote: 0,
        reply_count: 0
      };

      await client.query('COMMIT');
      return comment;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    } finally {
      client.release();
    }
  }

  static async getCommentById(commentId, studentId = null) {
    const client = await pool.connect();
    try {
      let userVoteJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let groupByUserColumns = '';
      
      const queryParams = [commentId];
      let paramIndex = 2;
      
      if (studentId) {
        userVoteJoin = `LEFT JOIN public.comment_votes cv ON c.comment_id = cv.comment_id AND cv.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(cv.vote_type, 0) as user_vote,`;
        groupByUserColumns = ', cv.vote_type';
        queryParams.push(studentId);
        paramIndex++;
      }

      const query = `
        SELECT 
          c.comment_id as id,
          c.comment_text as content,
          c.parent_comment_id,
          c.upvotes,
          c.downvotes,
          c.created_at,
          c.updated_at,
          u.username as author_username,
          u.student_id as author_id,
          u.contribution as author_contribution,
          ${userVoteSelect}
          COUNT(DISTINCT replies.comment_id) as reply_count
        FROM public.comments c
        LEFT JOIN public.users u ON c.student_id = u.student_id
        LEFT JOIN public.comments replies ON c.comment_id = replies.parent_comment_id
        ${userVoteJoin}
        WHERE c.comment_id = $1
        GROUP BY c.comment_id, u.username, u.student_id, u.contribution${groupByUserColumns}
      `;

      const result = await client.query(query, queryParams);
      
      return result.rows.length > 0 ? {
        ...result.rows[0],
        net_votes: result.rows[0].upvotes - result.rows[0].downvotes
      } : null;
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async updateComment(commentId, content) {
    const client = await pool.connect();
    try {
      const updateQuery = `
        UPDATE public.comments 
        SET comment_text = $1, updated_at = NOW()
        WHERE comment_id = $2
        RETURNING comment_id, comment_text, updated_at
      `;

      const result = await client.query(updateQuery, [content, commentId]);
      
      return result.rows.length > 0 ? {
        ...result.rows[0],
        id: result.rows[0].comment_id,
        content: result.rows[0].comment_text
      } : null;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    } finally {
      client.release();
    }
  }

  static async deleteComment(commentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete all replies first (cascade delete)
      await client.query('DELETE FROM public.comment_votes WHERE comment_id IN (SELECT comment_id FROM public.comments WHERE parent_comment_id = $1)', [commentId]);
      await client.query('DELETE FROM public.comments WHERE parent_comment_id = $1', [commentId]);
      
      // Delete votes for this comment
      await client.query('DELETE FROM public.comment_votes WHERE comment_id = $1', [commentId]);
      
      // Delete the comment
      const result = await client.query('DELETE FROM public.comments WHERE comment_id = $1 RETURNING comment_id', [commentId]);
      
      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    } finally {
      client.release();
    }
  }

  static async getCommentsByStudentId(studentId, options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 20, offset = 0, sortBy = 'recent' } = options;

      let orderClause = '';
      switch (sortBy) {
        case 'recent':
          orderClause = 'ORDER BY c.created_at DESC';
          break;
        case 'popular':
          orderClause = 'ORDER BY c.upvotes DESC, c.created_at DESC';
          break;
        default:
          orderClause = 'ORDER BY c.created_at DESC';
      }

      const query = `
        SELECT 
          c.comment_id as id,
          c.comment_text as content,
          c.parent_comment_id,
          c.upvotes,
          c.downvotes,
          c.created_at,
          c.updated_at,
          s.solution_id,
          s.solution_text,
          q.question_title,
          COUNT(DISTINCT replies.comment_id) as reply_count
        FROM public.comments c
        LEFT JOIN public.solutions s ON c.solution_id = s.solution_id
        LEFT JOIN public.questions q ON s.question_id = q.question_id
        LEFT JOIN public.comments replies ON c.comment_id = replies.parent_comment_id
        WHERE c.student_id = $1
        GROUP BY c.comment_id, s.solution_id, s.solution_text, q.question_title
        ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, [studentId, limit, offset]);
      
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes
      }));
    } catch (error) {
      console.error('Error fetching comments by student ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }
}

export default Comment;