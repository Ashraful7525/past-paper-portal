import pool from '../config/db.js';

class Solution {
  static async getSolutionsByPostId(postId, studentId = null) {
    const client = await pool.connect();
    try {
      console.log('Fetching solutions for post ID:', postId, 'for student:', studentId);
      
      // First, get the question_id from the post
      const postQuery = 'SELECT question_id FROM public.posts WHERE post_id = $1';
      const postResult = await client.query(postQuery, [postId]);
      
      console.log('Post query result:', postResult.rows);
      
      if (postResult.rows.length === 0) {
        console.log('Post not found, returning empty array');
        return []; // Return empty array if post doesn't exist
      }
      
      const questionId = postResult.rows[0].question_id;
      console.log('Question ID from post:', questionId);
      
      // If there's no question_id, return empty array
      if (!questionId) {
        console.log('No question_id found, returning empty array');
        return [];
      }

      // Build user-specific joins and selects for solution votes
      let userVoteJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let userBookmarkJoin = '';
      let userBookmarkSelect = 'false as is_bookmarked,';
      
      const queryParams = [questionId];
      let paramIndex = 2;
      
      if (studentId) {
        userVoteJoin = `LEFT JOIN public.solution_votes sv ON s.solution_id = sv.solution_id AND sv.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(sv.vote_type, 0) as user_vote,`;
        userBookmarkJoin = `LEFT JOIN public.bookmarks b ON s.solution_id = b.solution_id AND b.student_id = $${paramIndex}`;
        userBookmarkSelect = `CASE WHEN b.bookmark_id IS NOT NULL THEN true ELSE false END as is_bookmarked,`;
        queryParams.push(studentId);
        paramIndex++;
      }

      // Get solutions with detailed information - Fixed GROUP BY
      const query = `
        SELECT 
          s.solution_id as id,
          s.solution_text as content,
          s.file_url,
          s.solution_title,
          s.is_verified,
          s.upvotes,
          s.downvotes,
          s.rating,
          s.created_at,
          s.updated_at,
          u.username as author_username,
          u.student_id as author_id,
          u.contribution as author_contribution,
          ${userVoteSelect}
          ${userBookmarkSelect}
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags,
          COUNT(DISTINCT c.comment_id) as comment_count
        FROM public.solutions s
        LEFT JOIN public.users u ON s.student_id = u.student_id
        LEFT JOIN public.solution_tags st ON s.solution_id = st.solution_id
        LEFT JOIN public.tags t ON st.tag_id = t.tag_id
        LEFT JOIN public.comments c ON s.solution_id = c.solution_id
        ${userVoteJoin}
        ${userBookmarkJoin}
        WHERE s.question_id = $1
        GROUP BY s.solution_id, s.solution_text, s.file_url, s.solution_title, s.is_verified, s.upvotes, s.downvotes, s.rating, s.created_at, s.updated_at, u.username, u.student_id, u.contribution${studentId ? ', sv.vote_type, b.bookmark_id' : ''}
        ORDER BY s.is_verified DESC, s.upvotes DESC, s.created_at DESC
      `;

      console.log('Executing solutions query with question_id:', questionId, 'and student_id:', studentId);
      console.log('Query:', query);
      console.log('Query params:', queryParams);
      
      const result = await client.query(query, queryParams);
      console.log('Solutions query result with user votes:', result.rows);
      
      // Get comments for each solution
      const Comment = (await import('./Comment.js')).default;
      const solutions = await Promise.all(result.rows.map(async (solution) => {
        const comments = await Comment.getCommentsBySolutionId(solution.id, studentId);
        const formattedSolution = {
          ...solution,
          file_url: solution.file_url,
          comments,
          net_votes: solution.upvotes - solution.downvotes,
          user_vote: parseInt(solution.user_vote) || 0,
          upvotes: parseInt(solution.upvotes) || 0,
          downvotes: parseInt(solution.downvotes) || 0,
          rating: parseInt(solution.rating) || 0,
          comment_count: parseInt(solution.comment_count) || 0
        };
        
        console.log(`Solution ${solution.id} formatted with user_vote:`, formattedSolution.user_vote);
        return formattedSolution;
      }));
      
      return solutions;
    } catch (error) {
      console.error('Error fetching solutions:', error);
      console.error('Error stack:', error.stack);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async addSolution(postId, studentId, content, file_url = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, get the post details including question_id
      const postQuery = 'SELECT question_id, title, department_id FROM public.posts WHERE post_id = $1';
      const postResult = await client.query(postQuery, [postId]);
      
      if (postResult.rows.length === 0) {
        throw new Error('Post does not exist');
      }
      
      let questionId = postResult.rows[0].question_id;
      const { title, department_id } = postResult.rows[0];

      // If there's no question_id, create a question for this post
      if (!questionId) {
        // Note: According to schema, questions table requires course_id, semester_id, and year
        // For now, we'll need to handle this case differently or ensure posts have proper question_id
        throw new Error('Cannot add solution: Post must have a valid question_id');
      }

      // Insert the solution using correct column names from schema
      const insertQuery = `
        INSERT INTO public.solutions (question_id, student_id, solution_text, file_url, is_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, false, NOW(), NOW())
        RETURNING solution_id, solution_text, file_url, is_verified, created_at, updated_at
      `;
      
      const insertResult = await client.query(insertQuery, [questionId, studentId, content, file_url]);
      
      // Get the author username
      const userQuery = 'SELECT username FROM public.users WHERE student_id = $1';
      const userResult = await client.query(userQuery, [studentId]);
      
      const solution = {
        ...insertResult.rows[0],
        id: insertResult.rows[0].solution_id,
        content: insertResult.rows[0].solution_text, // Map solution_text to content for frontend
        file_url: insertResult.rows[0].file_url,
        author_username: userResult.rows[0]?.username || 'Unknown'
      };

      await client.query('COMMIT');
      return solution;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding solution:', error);
      throw new Error('Failed to add solution');
    } finally {
      client.release();
    }
  }

  static async getSolutionById(solutionId, studentId = null) {
    const client = await pool.connect();
    try {
      let userVoteJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let userBookmarkJoin = '';
      let userBookmarkSelect = 'false as is_bookmarked,';
      let groupByUserColumns = '';
      
      const queryParams = [solutionId];
      let paramIndex = 2;
      
      if (studentId) {
        userVoteJoin = `LEFT JOIN public.solution_votes sv ON s.solution_id = sv.solution_id AND sv.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(sv.vote_type, 0) as user_vote,`;
        userBookmarkJoin = `LEFT JOIN public.bookmarks b ON s.solution_id = b.solution_id AND b.student_id = $${paramIndex}`;
        userBookmarkSelect = `CASE WHEN b.bookmark_id IS NOT NULL THEN true ELSE false END as is_bookmarked,`;
        groupByUserColumns = ', sv.vote_type, b.bookmark_id';
        queryParams.push(studentId);
        paramIndex++;
      }

      const query = `
        SELECT 
          s.solution_id as id,
          s.solution_text as content,
          s.solution_title,
          s.is_verified,
          s.upvotes,
          s.downvotes,
          s.rating,
          s.created_at,
          s.updated_at,
          u.username as author_username,
          u.student_id as author_id,
          u.contribution as author_contribution,
          ${userVoteSelect}
          ${userBookmarkSelect}
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags
        FROM public.solutions s
        LEFT JOIN public.users u ON s.student_id = u.student_id
        LEFT JOIN public.solution_tags st ON s.solution_id = st.solution_id
        LEFT JOIN public.tags t ON st.tag_id = t.tag_id
        ${userVoteJoin}
        ${userBookmarkJoin}
        WHERE s.solution_id = $1
        GROUP BY s.solution_id, u.username, u.student_id, u.contribution${groupByUserColumns}
      `;

      const result = await client.query(query, queryParams);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error fetching solution by ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async updateSolution(solutionId, solutionData) {
    const client = await pool.connect();
    try {
      const { solution_text, solution_title } = solutionData;

      const updateQuery = `
        UPDATE public.solutions 
        SET solution_text = $1, solution_title = $2, updated_at = NOW()
        WHERE solution_id = $3
        RETURNING solution_id, solution_text, solution_title, updated_at
      `;

      const result = await client.query(updateQuery, [solution_text, solution_title, solutionId]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating solution:', error);
      throw new Error('Failed to update solution');
    } finally {
      client.release();
    }
  }

  static async deleteSolution(solutionId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete related data first
      await client.query('DELETE FROM public.solution_votes WHERE solution_id = $1', [solutionId]);
      await client.query('DELETE FROM public.bookmarks WHERE solution_id = $1', [solutionId]);
      await client.query('DELETE FROM public.solution_tags WHERE solution_id = $1', [solutionId]);
      await client.query('DELETE FROM public.comments WHERE solution_id = $1', [solutionId]);
      
      // Delete the solution
      const result = await client.query('DELETE FROM public.solutions WHERE solution_id = $1 RETURNING solution_id', [solutionId]);
      
      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting solution:', error);
      throw new Error('Failed to delete solution');
    } finally {
      client.release();
    }
  }

  static async getSolutionsByStudentId(studentId, options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 20, offset = 0, sortBy = 'recent' } = options;

      let orderClause = '';
      switch (sortBy) {
        case 'recent':
          orderClause = 'ORDER BY s.created_at DESC';
          break;
        case 'popular':
          orderClause = 'ORDER BY s.upvotes DESC, s.created_at DESC';
          break;
        case 'verified':
          orderClause = 'ORDER BY s.is_verified DESC, s.created_at DESC';
          break;
        default:
          orderClause = 'ORDER BY s.created_at DESC';
      }

      const query = `
        SELECT 
          s.solution_id as id,
          s.solution_text as content,
          s.solution_title,
          s.is_verified,
          s.upvotes,
          s.downvotes,
          s.rating,
          s.created_at,
          s.updated_at,
          q.question_title,
          q.question_text,
          COUNT(DISTINCT c.comment_id) as comment_count
        FROM public.solutions s
        LEFT JOIN public.questions q ON s.question_id = q.question_id
        LEFT JOIN public.comments c ON s.solution_id = c.solution_id
        WHERE s.student_id = $1
        GROUP BY s.solution_id, q.question_title, q.question_text
        ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, [studentId, limit, offset]);
      
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes
      }));
    } catch (error) {
      console.error('Error fetching solutions by student ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }
}

export default Solution;