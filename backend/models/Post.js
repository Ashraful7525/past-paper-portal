import pool from '../config/db.js';

class Post {
  static async getFeedPosts(options = {}) {
    const client = await pool.connect();
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = 'hot',
        timeRange = 'all',
        department_id = null,
        forYou = false,
        search = null,
        student_id = null,
        course_id = null,
        level = null,
        term = null,
        year = null,
        question_no = null,
      } = options;

      // Build ORDER BY clause based on sortBy
      let orderClause = '';
      switch (sortBy) {
        case 'hot':
          orderClause = 'ORDER BY (p.upvotes - p.downvotes + p.view_count * 0.1) DESC, p.created_at DESC';
          break;
        case 'new':
          orderClause = 'ORDER BY p.created_at DESC';
          break;
        case 'top':
          orderClause = 'ORDER BY (p.upvotes - p.downvotes) DESC, p.created_at DESC';
          break;
        default:
          orderClause = 'ORDER BY p.created_at DESC';
      }

      // Build time filter
      let timeFilter = '';
      if (timeRange !== 'all') {
        const timeMap = {
          hour: '1 HOUR',
          day: '1 DAY', 
          week: '1 WEEK',
          month: '1 MONTH',
          year: '1 YEAR'
        };
        if (timeMap[timeRange]) {
          timeFilter = `AND p.created_at >= NOW() - INTERVAL '${timeMap[timeRange]}'`;
        }
      }

      // Build filters
      let searchFilter = '';
      let departmentFilter = '';
      let courseFilter = '';
      let levelFilter = '';
      let termFilter = '';
      let yearFilter = '';
      let questionNoFilter = '';
      let forYouFilter = '';
      
      const queryParams = [limit, offset];
      let paramIndex = 3;

      if (search) {
        searchFilter = `AND (p.title ILIKE $${paramIndex} OR p.preview_text ILIKE $${paramIndex} OR q.question_text ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (department_id) {
        departmentFilter = `AND p.department_id = $${paramIndex}`;
        queryParams.push(department_id);
        paramIndex++;
      }

      if (course_id) {
        courseFilter = `AND c.course_id = $${paramIndex}`;
        queryParams.push(course_id);
        paramIndex++;
      }

      if (level) {
        levelFilter = `AND s.level = $${paramIndex}`;
        queryParams.push(parseInt(level));
        paramIndex++;
      }

      if (term) {
        termFilter = `AND s.term = $${paramIndex}`;
        queryParams.push(parseInt(term));
        paramIndex++;
      }

      if (year) {
        yearFilter = `AND q.year = $${paramIndex}`;
        queryParams.push(parseInt(year));
        paramIndex++;
      }

      if (question_no) {
        questionNoFilter = `AND q.question_no = $${paramIndex}`;
        queryParams.push(parseInt(question_no));
        paramIndex++;
      }

      // For You filter - only show posts from courses the user is enrolled in
      if (forYou && student_id) {
        forYouFilter = `AND c.course_id IN (
          SELECT e.course_id 
          FROM enrollments e 
          WHERE e.student_id = $${paramIndex} AND e.is_currently_enrolled = true
        )`;
        queryParams.push(student_id);
        paramIndex++;
      }

      // Build user-specific joins and selects
      let userVoteJoin = '';
      let userSaveJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let userSaveSelect = 'false as is_saved,';
      let groupByUserColumns = '';
      
      if (student_id) {
        userVoteJoin = `LEFT JOIN public.post_votes pv ON p.post_id = pv.post_id AND pv.student_id = $${paramIndex}`;
        userSaveJoin = `LEFT JOIN public.saved_posts sp ON p.post_id = sp.post_id AND sp.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(pv.vote_type, 0) as user_vote,`;
        userSaveSelect = `CASE WHEN sp.post_id IS NOT NULL THEN true ELSE false END as is_saved,`;
        groupByUserColumns = ', pv.vote_type, sp.post_id';
        queryParams.push(student_id);
        paramIndex++;
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
          p.created_at,
          p.updated_at,
          u.username as author_username,
          d.department_name,
          d.icon as department_icon,
          c.course_title,
          c.course_code,
          s.semester_name,
          s.level,
          s.term,
          q.is_verified,
          q.question_title,
          q.question_text,
          q.question_no,
          q.year as question_year,
          ${userVoteSelect}
          ${userSaveSelect}
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags,
          COUNT(DISTINCT sol.solution_id) as solution_count
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        LEFT JOIN public.questions q ON p.question_id = q.question_id
        LEFT JOIN public.courses c ON q.course_id = c.course_id
        LEFT JOIN public.semesters s ON q.semester_id = s.semester_id
        LEFT JOIN public.post_tags pt ON p.post_id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.tag_id
        LEFT JOIN public.solutions sol ON p.question_id = sol.question_id
        ${userVoteJoin}
        ${userSaveJoin}
        WHERE p.question_id IS NOT NULL
        ${timeFilter}
        ${searchFilter}
        ${departmentFilter}
        ${courseFilter}
        ${levelFilter}
        ${termFilter}
        ${yearFilter}
        ${questionNoFilter}
        ${forYouFilter}
        GROUP BY p.post_id, u.username, d.department_name, d.icon, c.course_title, c.course_code, s.semester_name, s.level, s.term, q.is_verified, q.question_title, q.question_text, q.question_no, q.year${groupByUserColumns}
        ${orderClause}
        LIMIT $1 OFFSET $2
      `;

      const result = await client.query(query, queryParams);
      
      // Ensure proper data type conversion for all posts
      return result.rows.map(post => ({
        ...post,
        user_vote: parseInt(post.user_vote) || 0,
        upvotes: parseInt(post.upvotes) || 0,
        downvotes: parseInt(post.downvotes) || 0,
        view_count: parseInt(post.view_count) || 0,
        download_count: parseInt(post.download_count) || 0,
        solution_count: parseInt(post.solution_count) || 0
      }));

    } catch (error) {
      console.error('Error fetching feed posts:', error);
      console.error('Query error details:', error.message);
      console.error('Error stack:', error.stack);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async getPostById(postId, studentId = null) {
    const client = await pool.connect();
    try {
      // Build user-specific joins and selects
      let userVoteJoin = '';
      let userSaveJoin = '';
      let userVoteSelect = '0 as user_vote,';
      let userSaveSelect = 'false as is_saved,';
      let groupByUserColumns = '';
      
      const queryParams = [postId];
      let paramIndex = 2;
      
      if (studentId) {
        userVoteJoin = `LEFT JOIN public.post_votes pv ON p.post_id = pv.post_id AND pv.student_id = $${paramIndex}`;
        userSaveJoin = `LEFT JOIN public.saved_posts sp ON p.post_id = sp.post_id AND sp.student_id = $${paramIndex}`;
        userVoteSelect = `COALESCE(pv.vote_type, 0) as user_vote,`;
        userSaveSelect = `CASE WHEN sp.post_id IS NOT NULL THEN true ELSE false END as is_saved,`;
        groupByUserColumns = ', pv.vote_type, sp.post_id';
        queryParams.push(studentId);
        paramIndex++;
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
          p.created_at,
          p.updated_at,
          u.username as author_username,
          d.department_name,
          d.icon as department_icon,
          c.course_title,
          s.semester_name,
          q.is_verified,
          q.question_title,
          q.question_text,
          q.question_no,
          q.year as question_year,
          ${userVoteSelect}
          ${userSaveSelect}
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        LEFT JOIN public.questions q ON p.question_id = q.question_id
        LEFT JOIN public.courses c ON q.course_id = c.course_id
        LEFT JOIN public.semesters s ON q.semester_id = s.semester_id
        LEFT JOIN public.post_tags pt ON p.post_id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.tag_id
        ${userVoteJoin}
        ${userSaveJoin}
        WHERE p.post_id = $1 AND p.question_id IS NOT NULL
        GROUP BY p.post_id, p.title, p.content, p.preview_text, p.file_url, p.file_size, p.upvotes, p.downvotes, p.view_count, p.download_count, p.is_featured, p.created_at, p.updated_at, u.username, d.department_name, d.icon, c.course_title, s.semester_name, q.is_verified, q.question_title, q.question_text, q.question_no, q.year${groupByUserColumns}
      `;

      const result = await client.query(query, queryParams);
      
      if (result.rows.length === 0) return null;
      
      const post = result.rows[0];
      
      // Ensure user_vote is properly converted to integer
      return {
        ...post,
        user_vote: parseInt(post.user_vote) || 0,
        upvotes: parseInt(post.upvotes) || 0,
        downvotes: parseInt(post.downvotes) || 0,
        view_count: parseInt(post.view_count) || 0,
        download_count: parseInt(post.download_count) || 0
      };
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async incrementViewCount(postId) {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE public.posts SET view_count = view_count + 1 WHERE post_id = $1',
        [postId]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw new Error('Failed to track view');
    } finally {
      client.release();
    }
  }

  static async createPost(postData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { title, content, preview_text, file_url, file_size, student_id, department_id, question_id } = postData;

      const insertQuery = `
        INSERT INTO public.posts (title, content, preview_text, file_url, file_size, student_id, department_id, question_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING post_id, title, content, preview_text, file_url, file_size, created_at, updated_at
      `;

      const result = await client.query(insertQuery, [
        title, content, preview_text, file_url, file_size, student_id, department_id, question_id
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    } finally {
      client.release();
    }
  }

  static async updatePost(postId, postData) {
    const client = await pool.connect();
    try {
      const { title, content, preview_text } = postData;

      const updateQuery = `
        UPDATE public.posts 
        SET title = $1, content = $2, preview_text = $3, updated_at = NOW()
        WHERE post_id = $4
        RETURNING post_id, title, content, preview_text, updated_at
      `;

      const result = await client.query(updateQuery, [title, content, preview_text, postId]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    } finally {
      client.release();
    }
  }

  static async deletePost(postId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete related data first
      await client.query('DELETE FROM public.post_votes WHERE post_id = $1', [postId]);
      await client.query('DELETE FROM public.saved_posts WHERE post_id = $1', [postId]);
      await client.query('DELETE FROM public.post_tags WHERE post_id = $1', [postId]);
      
      // Delete the post
      const result = await client.query('DELETE FROM public.posts WHERE post_id = $1 RETURNING post_id', [postId]);
      
      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    } finally {
      client.release();
    }
  }
}

export default Post;