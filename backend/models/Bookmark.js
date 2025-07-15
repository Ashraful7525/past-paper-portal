import pool from '../config/db.js';

class Bookmark {
  // Post saving methods
  static async toggleSavePost(postId, studentId) {
    const client = await pool.connect();
    try {
      // Check if post is already saved
      const existingSave = await client.query(
        'SELECT save_id FROM public.saved_posts WHERE post_id = $1 AND student_id = $2',
        [postId, studentId]
      );

      let isSaved = false;
      
      if (existingSave.rows.length > 0) {
        // Remove save
        await client.query(
          'DELETE FROM public.saved_posts WHERE post_id = $1 AND student_id = $2',
          [postId, studentId]
        );
        isSaved = false;
      } else {
        // Add save
        await client.query(
          'INSERT INTO public.saved_posts (post_id, student_id) VALUES ($1, $2)',
          [postId, studentId]
        );
        isSaved = true;
      }

      return { isSaved };
    } catch (error) {
      console.error('Error toggling save post:', error);
      throw new Error('Failed to save/unsave post');
    } finally {
      client.release();
    }
  }

  // Solution bookmarking methods
  static async toggleBookmarkSolution(solutionId, studentId) {
    const client = await pool.connect();
    try {
      // Check if solution is already bookmarked
      const existingBookmark = await client.query(
        'SELECT bookmark_id FROM public.bookmarks WHERE solution_id = $1 AND student_id = $2',
        [solutionId, studentId]
      );

      let isBookmarked = false;
      
      if (existingBookmark.rows.length > 0) {
        // Remove bookmark
        await client.query(
          'DELETE FROM public.bookmarks WHERE solution_id = $1 AND student_id = $2',
          [solutionId, studentId]
        );
        isBookmarked = false;
      } else {
        // Add bookmark
        await client.query(
          'INSERT INTO public.bookmarks (solution_id, student_id) VALUES ($1, $2)',
          [solutionId, studentId]
        );
        isBookmarked = true;
      }

      return { isBookmarked };
    } catch (error) {
      console.error('Error toggling bookmark solution:', error);
      throw new Error('Failed to bookmark/unbookmark solution');
    } finally {
      client.release();
    }
  }

  // Get user's saved posts
  static async getSavedPosts(studentId, options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 20, offset = 0, sortBy = 'recent' } = options;

      let orderClause = '';
      switch (sortBy) {
        case 'recent':
          orderClause = 'ORDER BY sp.created_at DESC';
          break;
        case 'popular':
          orderClause = 'ORDER BY p.upvotes DESC, sp.created_at DESC';
          break;
        case 'oldest':
          orderClause = 'ORDER BY sp.created_at ASC';
          break;
        default:
          orderClause = 'ORDER BY sp.created_at DESC';
      }

      const query = `
        SELECT 
          p.post_id,
          p.title,
          p.content,
          p.preview_text,
          p.file_url,
          p.file_size,
          p.upvotes,
          p.downvotes,
          p.view_count,
          p.download_count,
          p.is_featured,
          p.created_at as post_created_at,
          p.updated_at as post_updated_at,
          u.username as author_username,
          d.department_name,
          d.icon as department_icon,
          sp.created_at as saved_at,
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags
        FROM public.saved_posts sp
        JOIN public.posts p ON sp.post_id = p.post_id
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        LEFT JOIN public.post_tags pt ON p.post_id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.tag_id
        WHERE sp.student_id = $1 AND p.question_id IS NOT NULL
        GROUP BY p.post_id, u.username, d.department_name, d.icon, sp.created_at
        ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, [studentId, limit, offset]);
      
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes,
        is_saved: true
      }));
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get user's bookmarked solutions
  static async getBookmarkedSolutions(studentId, options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 20, offset = 0, sortBy = 'recent' } = options;

      let orderClause = '';
      switch (sortBy) {
        case 'recent':
          orderClause = 'ORDER BY b.created_at DESC';
          break;
        case 'popular':
          orderClause = 'ORDER BY s.upvotes DESC, b.created_at DESC';
          break;
        case 'oldest':
          orderClause = 'ORDER BY b.created_at ASC';
          break;
        default:
          orderClause = 'ORDER BY b.created_at DESC';
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
          s.created_at as solution_created_at,
          s.updated_at as solution_updated_at,
          u.username as author_username,
          u.student_id as author_id,
          u.contribution as author_contribution,
          q.question_title,
          q.question_text,
          b.created_at as bookmarked_at,
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags
        FROM public.bookmarks b
        JOIN public.solutions s ON b.solution_id = s.solution_id
        LEFT JOIN public.users u ON s.student_id = u.student_id
        LEFT JOIN public.questions q ON s.question_id = q.question_id
        LEFT JOIN public.solution_tags st ON s.solution_id = st.solution_id
        LEFT JOIN public.tags t ON st.tag_id = t.tag_id
        WHERE b.student_id = $1
        GROUP BY s.solution_id, u.username, u.student_id, u.contribution, q.question_title, q.question_text, b.created_at
        ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, [studentId, limit, offset]);
      
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes,
        is_bookmarked: true
      }));
    } catch (error) {
      console.error('Error fetching bookmarked solutions:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Check if post is saved by user
  static async isPostSaved(postId, studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT save_id FROM public.saved_posts WHERE post_id = $1 AND student_id = $2';
      const result = await client.query(query, [postId, studentId]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if post is saved:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Check if solution is bookmarked by user
  static async isSolutionBookmarked(solutionId, studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT bookmark_id FROM public.bookmarks WHERE solution_id = $1 AND student_id = $2';
      const result = await client.query(query, [solutionId, studentId]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if solution is bookmarked:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get count of saved posts by user
  static async getSavedPostsCount(studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT COUNT(*) as count FROM public.saved_posts WHERE student_id = $1';
      const result = await client.query(query, [studentId]);
      
      return parseInt(result.rows[0].count || 0);
    } catch (error) {
      console.error('Error fetching saved posts count:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get count of bookmarked solutions by user
  static async getBookmarkedSolutionsCount(studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT COUNT(*) as count FROM public.bookmarks WHERE student_id = $1';
      const result = await client.query(query, [studentId]);
      
      return parseInt(result.rows[0].count || 0);
    } catch (error) {
      console.error('Error fetching bookmarked solutions count:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Remove all saved posts by user
  static async clearSavedPosts(studentId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM public.saved_posts WHERE student_id = $1',
        [studentId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error clearing saved posts:', error);
      throw new Error('Failed to clear saved posts');
    } finally {
      client.release();
    }
  }

  // Remove all bookmarked solutions by user
  static async clearBookmarkedSolutions(studentId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM public.bookmarks WHERE student_id = $1',
        [studentId]
      );
      
      return result.rowCount;
    } catch (error) {
      console.error('Error clearing bookmarked solutions:', error);
      throw new Error('Failed to clear bookmarked solutions');
    } finally {
      client.release();
    }
  }
}

export default Bookmark;