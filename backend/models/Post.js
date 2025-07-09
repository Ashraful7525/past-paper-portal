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
        student_id = 0,
      } = options;

      // same logic for orderClause, filters etc...

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

      let timeFilter = '';
      if (timeRange !== 'all') {
        const timeMap = {
          hour: '1 HOUR',
          day: '1 DAY', 
          week: '1 WEEK',
          month: '1 MONTH',
          year: '1 YEAR'
        };
        timeFilter = `AND p.created_at >= NOW() - INTERVAL '${timeMap[timeRange]}'`;
      }

      let searchFilter = '';
      if (search) {
        searchFilter = `AND (p.title ILIKE $4 OR p.preview_text ILIKE $4)`;
      }

      let departmentFilter = '';
      if (department_id) {
        departmentFilter = `AND p.department_id = $5`;
      }

      // Prepare values array according to which filters are active
      const values = [student_id, limit, offset];
      if (search) values.push(`%${search}%`);
      if (department_id) values.push(department_id);

      const query = `
        SELECT 
          p.*,
          u.username as author_username,
          d.department_name,
          d.icon as department_icon,
          c.course_title,
          s.semester_name,
          COALESCE(pv.user_vote, 0) as user_vote,
          COALESCE(sp.is_saved, false) as is_saved,
          ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) as tags,
          COUNT(DISTINCT comments.comment_id) as comment_count
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        LEFT JOIN public.questions q ON p.question_id = q.question_id
        LEFT JOIN public.courses c ON q.course_id = c.course_id
        LEFT JOIN public.semesters s ON q.semester_id = s.semester_id
        LEFT JOIN public.post_tags pt ON p.post_id = pt.post_id
        LEFT JOIN public.tags t ON pt.tag_id = t.tag_id
        LEFT JOIN public.comments ON p.question_id = comments.solution_id
        LEFT JOIN (
          SELECT post_id, vote_type as user_vote 
          FROM public.post_votes 
          WHERE student_id = $1
        ) pv ON p.post_id = pv.post_id
        LEFT JOIN (
          SELECT post_id, true as is_saved 
          FROM public.saved_posts 
          WHERE student_id = $1
        ) sp ON p.post_id = sp.post_id
        WHERE 1=1 
        ${timeFilter}
        ${searchFilter}
        ${departmentFilter}
        GROUP BY p.post_id, u.username, d.department_name, d.icon, c.course_title, s.semester_name, pv.user_vote, sp.is_saved
        ${orderClause}
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, values);
      return result.rows;

    } catch (error) {
      console.error('Error fetching feed posts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Implement other methods (votePost, toggleSavePost, incrementViewCount) similarly using client.query()
}

export default Post;
