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
        search = null,
        student_id = null,
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

      // Build search filter
      let searchFilter = '';
      const queryParams = [limit, offset];
      let paramIndex = 3;

      if (search) {
        searchFilter = `AND (p.title ILIKE $${paramIndex} OR p.preview_text ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Build department filter
      let departmentFilter = '';
      if (department_id) {
        departmentFilter = `AND p.department_id = $${paramIndex}`;
        queryParams.push(department_id);
        paramIndex++;
      }

      // Add student_id for user-specific data (votes, saves)
      let studentIdParamIndex = paramIndex;
      if (student_id) {
        queryParams.push(student_id);
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
          ${student_id ? `COALESCE(pv.vote_type, 0) as user_vote,` : '0 as user_vote,'}
          ${student_id ? `CASE WHEN sp.post_id IS NOT NULL THEN true ELSE false END as is_saved,` : 'false as is_saved,'}
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags,
          COUNT(DISTINCT cm.comment_id) as comment_count
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        LEFT JOIN public.questions q ON p.question_id = q.question_id
        LEFT JOIN public.courses c ON q.course_id = c.course_id
        LEFT JOIN public.semesters s ON q.semester_id = s.semester_id
        LEFT JOIN public.post_tags pt ON p.post_id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.tag_id
        LEFT JOIN public.comments cm ON p.question_id = cm.solution_id
        ${student_id ? `LEFT JOIN public.post_votes pv ON p.post_id = pv.post_id AND pv.student_id = ${studentIdParamIndex}` : ''}
        ${student_id ? `LEFT JOIN public.saved_posts sp ON p.post_id = sp.post_id AND sp.student_id = ${studentIdParamIndex}` : ''}
        WHERE 1=1 
        ${timeFilter}
        ${searchFilter}
        ${departmentFilter}
        GROUP BY p.post_id, u.username, d.department_name, d.icon, c.course_title, s.semester_name, q.is_verified
        ${student_id ? ', pv.vote_type, sp.post_id' : ''}
        ${orderClause}
        LIMIT $1 OFFSET $2
      `;

      const result = await client.query(query, queryParams);
      return result.rows;

    } catch (error) {
      console.error('Error fetching feed posts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  static async votePost(postId, studentId, voteType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user already voted
      const existingVote = await client.query(
        'SELECT vote_type FROM public.post_votes WHERE post_id = $1 AND student_id = $2',
        [postId, studentId]
      );

      let oldVoteType = 0;
      if (existingVote.rows.length > 0) {
        oldVoteType = existingVote.rows[0].vote_type;
      }

      if (voteType === 0) {
        // Remove vote
        await client.query(
          'DELETE FROM public.post_votes WHERE post_id = $1 AND student_id = $2',
          [postId, studentId]
        );
      } else {
        // Insert or update vote
        await client.query(`
          INSERT INTO public.post_votes (post_id, student_id, vote_type)
          VALUES ($1, $2, $3)
          ON CONFLICT (post_id, student_id) 
          DO UPDATE SET vote_type = $3, created_at = NOW()
        `, [postId, studentId, voteType]);
      }

      // Update post upvotes/downvotes counts
      const voteCountQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
        FROM public.post_votes 
        WHERE post_id = $1
      `;
      const voteCountResult = await client.query(voteCountQuery, [postId]);
      const { upvotes, downvotes } = voteCountResult.rows[0];

      await client.query(
        'UPDATE public.posts SET upvotes = $1, downvotes = $2 WHERE post_id = $3',
        [upvotes, downvotes, postId]
      );

      await client.query('COMMIT');

      return {
        upvotes: parseInt(upvotes),
        downvotes: parseInt(downvotes),
        userVote: voteType
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error voting on post:', error);
      throw new Error('Failed to vote on post');
    } finally {
      client.release();
    }
  }

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

  static async getDepartmentStats() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          d.department_id,
          d.department_name,
          d.icon,
          COUNT(p.post_id) as post_count,
          COUNT(DISTINCT q.question_id) as question_count,
          COUNT(DISTINCT s.solution_id) as solution_count,
          COALESCE(
            ROUND(
              ((COUNT(p.post_id) - LAG(COUNT(p.post_id)) OVER (ORDER BY d.department_id)) / 
               NULLIF(LAG(COUNT(p.post_id)) OVER (ORDER BY d.department_id), 0) * 100), 0
            ), 0
          ) as trend_percentage
        FROM public.departments d
        LEFT JOIN public.posts p ON d.department_id = p.department_id
        LEFT JOIN public.questions q ON p.question_id = q.question_id
        LEFT JOIN public.solutions s ON q.question_id = s.question_id
        GROUP BY d.department_id, d.department_name, d.icon
        ORDER BY post_count DESC
      `;
      
      const result = await client.query(query);
      return result.rows.map(row => ({
        ...row,
        trend: row.trend_percentage > 0 ? `+${row.trend_percentage}%` : `${row.trend_percentage}%`
      }));
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw new Error('Failed to fetch department statistics');
    } finally {
      client.release();
    }
  }

  static async getGlobalStats() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM public.posts) as total_posts,
          (SELECT COUNT(DISTINCT student_id) FROM public.posts WHERE created_at >= NOW() - INTERVAL '1 month') as active_users,
          (SELECT COUNT(*) FROM public.solutions) as total_solutions
      `;
      
      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw new Error('Failed to fetch global statistics');
    } finally {
      client.release();
    }
  }
}

export default Post;