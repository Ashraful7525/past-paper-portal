import pool from '../config/db.js';

class Stats {
  // Get global platform statistics
  static async getGlobalStats() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM public.posts) as total_posts,
          (SELECT COUNT(DISTINCT student_id) FROM public.posts WHERE created_at >= NOW() - INTERVAL '1 month') as active_users,
          (SELECT COUNT(*) FROM public.solutions) as total_solutions,
          (SELECT COUNT(*) FROM public.comments) as total_comments,
          (SELECT COUNT(*) FROM public.users) as total_users,
          (SELECT COUNT(*) FROM public.questions) as total_questions
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

  // Get department statistics
  static async getDepartmentStats() {
    const client = await pool.connect();
    try {
      const query = `
        WITH department_stats AS (
          SELECT 
            d.department_id,
            d.department_name,
            d.icon,
            COUNT(p.post_id) as post_count,
            (SELECT COUNT(DISTINCT q.question_id) 
             FROM public.posts p2 
             LEFT JOIN public.questions q ON p2.question_id = q.question_id 
             WHERE p2.department_id = d.department_id) as question_count,
            (SELECT COUNT(DISTINCT s.solution_id) 
             FROM public.posts p3 
             LEFT JOIN public.questions q2 ON p3.question_id = q2.question_id
             LEFT JOIN public.solutions s ON q2.question_id = s.question_id
             WHERE p3.department_id = d.department_id) as solution_count
          FROM public.departments d
          LEFT JOIN public.posts p ON d.department_id = p.department_id
          GROUP BY d.department_id, d.department_name, d.icon
        ),
        total_posts AS (
          SELECT COUNT(*) as total_post_count FROM public.posts
        )
        SELECT 
          ds.*,
          tp.total_post_count,
          CASE 
            WHEN tp.total_post_count = 0 THEN 0
            ELSE ROUND((ds.post_count * 100.0 / tp.total_post_count), 1)
          END as percentage_of_total
        FROM department_stats ds
        CROSS JOIN total_posts tp
        ORDER BY ds.post_count DESC
      `;
      
      const result = await client.query(query);
      return result.rows.map(row => ({
        ...row,
        trend_percentage: row.percentage_of_total,
        trend: `${row.percentage_of_total}%`
      }));
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw new Error('Failed to fetch department statistics');
    } finally {
      client.release();
    }
  }

  // Get user statistics
  static async getUserStats(studentId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM public.posts WHERE student_id = $1) as posts_count,
          (SELECT COUNT(*) FROM public.solutions WHERE student_id = $1) as solutions_count,
          (SELECT COUNT(*) FROM public.comments WHERE student_id = $1) as comments_count,
          (SELECT COUNT(*) FROM public.saved_posts WHERE student_id = $1) as saved_posts_count,
          (SELECT COUNT(*) FROM public.bookmarks WHERE student_id = $1) as bookmarked_solutions_count,
          (SELECT COALESCE(SUM(upvotes), 0) FROM public.posts WHERE student_id = $1) as total_post_upvotes,
          (SELECT COALESCE(SUM(upvotes), 0) FROM public.solutions WHERE student_id = $1) as total_solution_upvotes,
          (SELECT COALESCE(SUM(upvotes), 0) FROM public.comments WHERE student_id = $1) as total_comment_upvotes,
          (SELECT contribution FROM public.users WHERE student_id = $1) as contribution_score
      `;
      
      const result = await client.query(query, [studentId]);
      const stats = result.rows[0];
      
      return {
        ...stats,
        total_upvotes: parseInt(stats.total_post_upvotes || 0) + 
                      parseInt(stats.total_solution_upvotes || 0) + 
                      parseInt(stats.total_comment_upvotes || 0),
        reputation: this.calculateReputation(stats)
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    } finally {
      client.release();
    }
  }

  // Calculate user reputation based on various metrics
  static calculateReputation(stats) {
    const postPoints = parseInt(stats.posts_count || 0) * 5;
    const solutionPoints = parseInt(stats.solutions_count || 0) * 10;
    const commentPoints = parseInt(stats.comments_count || 0) * 2;
    const upvotePoints = parseInt(stats.total_post_upvotes || 0) + 
                        parseInt(stats.total_solution_upvotes || 0) + 
                        parseInt(stats.total_comment_upvotes || 0);
    
    return postPoints + solutionPoints + commentPoints + upvotePoints;
  }

  // Get trending posts (hot posts in last 24 hours)
  static async getTrendingPosts(options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 10, timeframe = '24 hours' } = options;

      const query = `
        SELECT 
          p.post_id,
          p.title,
          p.upvotes,
          p.downvotes,
          p.view_count,
          p.created_at,
          u.username as author_username,
          d.department_name,
          (p.upvotes - p.downvotes + p.view_count * 0.1) as hot_score
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        WHERE p.created_at >= NOW() - INTERVAL '${timeframe}'
        ORDER BY hot_score DESC, p.created_at DESC
        LIMIT $1
      `;
      
      const result = await client.query(query, [limit]);
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes
      }));
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw new Error('Failed to fetch trending posts');
    } finally {
      client.release();
    }
  }

  // Get top contributors
  static async getTopContributors(options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 10, timeframe = '1 month' } = options;

      const query = `
        SELECT 
          u.student_id,
          u.username,
          u.contribution,
          COUNT(DISTINCT p.post_id) as posts_count,
          COUNT(DISTINCT s.solution_id) as solutions_count,
          COUNT(DISTINCT c.comment_id) as comments_count,
          COALESCE(SUM(DISTINCT p.upvotes), 0) + 
          COALESCE(SUM(DISTINCT s.upvotes), 0) + 
          COALESCE(SUM(DISTINCT c.upvotes), 0) as total_upvotes
        FROM public.users u
        LEFT JOIN public.posts p ON u.student_id = p.student_id 
          AND p.created_at >= NOW() - INTERVAL '${timeframe}'
        LEFT JOIN public.solutions s ON u.student_id = s.student_id 
          AND s.created_at >= NOW() - INTERVAL '${timeframe}'
        LEFT JOIN public.comments c ON u.student_id = c.student_id 
          AND c.created_at >= NOW() - INTERVAL '${timeframe}'
        GROUP BY u.student_id, u.username, u.contribution
        HAVING COUNT(DISTINCT p.post_id) + COUNT(DISTINCT s.solution_id) + COUNT(DISTINCT c.comment_id) > 0
        ORDER BY total_upvotes DESC, u.contribution DESC
        LIMIT $1
      `;
      
      const result = await client.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching top contributors:', error);
      throw new Error('Failed to fetch top contributors');
    } finally {
      client.release();
    }
  }

  // Get activity timeline for a user
  static async getUserActivityTimeline(studentId, options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 50, days = 30 } = options;

      const query = `
        SELECT 
          'post' as activity_type,
          p.post_id as item_id,
          p.title as item_title,
          p.created_at,
          p.upvotes,
          p.downvotes,
          d.department_name
        FROM public.posts p
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        WHERE p.student_id = $1 AND p.created_at >= NOW() - INTERVAL '${days} days'
        
        UNION ALL
        
        SELECT 
          'solution' as activity_type,
          s.solution_id as item_id,
          COALESCE(s.solution_title, 'Solution') as item_title,
          s.created_at,
          s.upvotes,
          s.downvotes,
          null as department_name
        FROM public.solutions s
        WHERE s.student_id = $1 AND s.created_at >= NOW() - INTERVAL '${days} days'
        
        UNION ALL
        
        SELECT 
          'comment' as activity_type,
          c.comment_id as item_id,
          'Comment' as item_title,
          c.created_at,
          c.upvotes,
          c.downvotes,
          null as department_name
        FROM public.comments c
        WHERE c.student_id = $1 AND c.created_at >= NOW() - INTERVAL '${days} days'
        
        ORDER BY created_at DESC
        LIMIT $2
      `;
      
      const result = await client.query(query, [studentId, limit]);
      return result.rows.map(row => ({
        ...row,
        net_votes: row.upvotes - row.downvotes
      }));
    } catch (error) {
      console.error('Error fetching user activity timeline:', error);
      throw new Error('Failed to fetch user activity timeline');
    } finally {
      client.release();
    }
  }

  // Get platform growth metrics
  static async getGrowthMetrics(options = {}) {
    const client = await pool.connect();
    try {
      const { days = 30 } = options;

      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE table_name = 'posts') as new_posts,
          COUNT(*) FILTER (WHERE table_name = 'solutions') as new_solutions,
          COUNT(*) FILTER (WHERE table_name = 'users') as new_users,
          COUNT(*) FILTER (WHERE table_name = 'comments') as new_comments
        FROM (
          SELECT created_at, 'posts' as table_name FROM public.posts 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
          UNION ALL
          SELECT created_at, 'solutions' as table_name FROM public.solutions 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
          UNION ALL
          SELECT created_at, 'users' as table_name FROM public.users 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
          UNION ALL
          SELECT created_at, 'comments' as table_name FROM public.comments 
          WHERE created_at >= NOW() - INTERVAL '${days} days'
        ) combined
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      throw new Error('Failed to fetch growth metrics');
    } finally {
      client.release();
    }
  }

  // Get most popular tags
  static async getPopularTags(options = {}) {
    const client = await pool.connect();
    try {
      const { limit = 20, timeframe = '1 month' } = options;

      const query = `
        SELECT 
          t.tag_name,
          COUNT(DISTINCT pt.post_id) as post_count,
          COUNT(DISTINCT st.solution_id) as solution_count,
          COUNT(DISTINCT pt.post_id) + COUNT(DISTINCT st.solution_id) as total_usage
        FROM public.tags t
        LEFT JOIN public.post_tags pt ON t.tag_id = pt.tag_id
        LEFT JOIN public.posts p ON pt.post_id = p.post_id 
          AND p.created_at >= NOW() - INTERVAL '${timeframe}'
        LEFT JOIN public.solution_tags st ON t.tag_id = st.tag_id
        LEFT JOIN public.solutions s ON st.solution_id = s.solution_id 
          AND s.created_at >= NOW() - INTERVAL '${timeframe}'
        GROUP BY t.tag_id, t.tag_name
        HAVING COUNT(DISTINCT pt.post_id) + COUNT(DISTINCT st.solution_id) > 0
        ORDER BY total_usage DESC
        LIMIT $1
      `;
      
      const result = await client.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw new Error('Failed to fetch popular tags');
    } finally {
      client.release();
    }
  }

  // Get engagement metrics
  static async getEngagementMetrics(options = {}) {
    const client = await pool.connect();
    try {
      const { days = 7 } = options;

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM public.post_votes WHERE created_at >= NOW() - INTERVAL '${days} days') as post_votes,
          (SELECT COUNT(*) FROM public.solution_votes WHERE created_at >= NOW() - INTERVAL '${days} days') as solution_votes,
          (SELECT COUNT(*) FROM public.comment_votes WHERE created_at >= NOW() - INTERVAL '${days} days') as comment_votes,
          (SELECT COUNT(*) FROM public.saved_posts WHERE created_at >= NOW() - INTERVAL '${days} days') as saves,
          (SELECT COUNT(*) FROM public.bookmarks WHERE created_at >= NOW() - INTERVAL '${days} days') as bookmarks,
          (SELECT SUM(view_count) FROM public.posts WHERE created_at >= NOW() - INTERVAL '${days} days') as total_views
      `;
      
      const result = await client.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      throw new Error('Failed to fetch engagement metrics');
    } finally {
      client.release();
    }
  }
}

export default Stats;