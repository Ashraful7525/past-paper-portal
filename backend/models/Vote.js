import pool from '../config/db.js';

class Vote {
  // Post voting methods
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

  // Solution voting methods
  static async voteSolution(solutionId, studentId, voteType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Convert numeric voteType to string for database storage
      let voteTypeString = null;
      if (voteType === 1) {
        voteTypeString = 'upvote';
      } else if (voteType === -1) {
        voteTypeString = 'downvote';
      }

      if (voteType === 0) {
        // Remove vote
        await client.query(
          'DELETE FROM public.solution_votes WHERE solution_id = $1 AND student_id = $2',
          [solutionId, studentId]
        );
      } else {
        // Insert or update vote
        await client.query(`
          INSERT INTO public.solution_votes (solution_id, student_id, vote_type)
          VALUES ($1, $2, $3)
          ON CONFLICT (solution_id, student_id) 
          DO UPDATE SET vote_type = $3, created_at = NOW()
        `, [solutionId, studentId, voteTypeString]);
      }

      // Update solution upvotes/downvotes counts
      const voteCountQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes
        FROM public.solution_votes 
        WHERE solution_id = $1
      `;
      const voteCountResult = await client.query(voteCountQuery, [solutionId]);
      const { upvotes, downvotes } = voteCountResult.rows[0];

      await client.query(
        'UPDATE public.solutions SET upvotes = $1, downvotes = $2 WHERE solution_id = $3',
        [upvotes, downvotes, solutionId]
      );

      await client.query('COMMIT');

      return {
        upvotes: parseInt(upvotes),
        downvotes: parseInt(downvotes),
        userVote: voteType
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error voting on solution:', error);
      throw new Error('Failed to vote on solution');
    } finally {
      client.release();
    }
  }

  // Comment voting methods
  static async voteComment(commentId, studentId, voteType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Convert numeric voteType to string for database storage
      let voteTypeString = null;
      if (voteType === 1) {
        voteTypeString = 'upvote';
      } else if (voteType === -1) {
        voteTypeString = 'downvote';
      }

      if (voteType === 0) {
        // Remove vote
        await client.query(
          'DELETE FROM public.comment_votes WHERE comment_id = $1 AND student_id = $2',
          [commentId, studentId]
        );
      } else {
        // Insert or update vote
        await client.query(`
          INSERT INTO public.comment_votes (comment_id, student_id, vote_type)
          VALUES ($1, $2, $3)
          ON CONFLICT (comment_id, student_id) 
          DO UPDATE SET vote_type = $3, created_at = NOW()
        `, [commentId, studentId, voteTypeString]);
      }

      // Update comment upvotes/downvotes counts
      const voteCountQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes
        FROM public.comment_votes 
        WHERE comment_id = $1
      `;
      const voteCountResult = await client.query(voteCountQuery, [commentId]);
      const { upvotes, downvotes } = voteCountResult.rows[0];

      await client.query(
        'UPDATE public.comments SET upvotes = $1, downvotes = $2 WHERE comment_id = $3',
        [upvotes, downvotes, commentId]
      );

      await client.query('COMMIT');

      return {
        upvotes: parseInt(upvotes),
        downvotes: parseInt(downvotes),
        userVote: voteType
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error voting on comment:', error);
      throw new Error('Failed to vote on comment');
    } finally {
      client.release();
    }
  }

  // Get user's vote for a post
  static async getUserPostVote(postId, studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT vote_type FROM public.post_votes WHERE post_id = $1 AND student_id = $2';
      const result = await client.query(query, [postId, studentId]);
      
      return result.rows.length > 0 ? result.rows[0].vote_type : 0;
    } catch (error) {
      console.error('Error fetching user post vote:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get user's vote for a solution
  static async getUserSolutionVote(solutionId, studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT vote_type FROM public.solution_votes WHERE solution_id = $1 AND student_id = $2';
      const result = await client.query(query, [solutionId, studentId]);
      
      if (result.rows.length === 0) return 0;
      
      const voteType = result.rows[0].vote_type;
      return voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : 0;
    } catch (error) {
      console.error('Error fetching user solution vote:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get user's vote for a comment
  static async getUserCommentVote(commentId, studentId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT vote_type FROM public.comment_votes WHERE comment_id = $1 AND student_id = $2';
      const result = await client.query(query, [commentId, studentId]);
      
      if (result.rows.length === 0) return 0;
      
      const voteType = result.rows[0].vote_type;
      return voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : 0;
    } catch (error) {
      console.error('Error fetching user comment vote:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get vote counts for a post
  static async getPostVoteCounts(postId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
        FROM public.post_votes 
        WHERE post_id = $1
      `;
      const result = await client.query(query, [postId]);
      
      return {
        upvotes: parseInt(result.rows[0].upvotes || 0),
        downvotes: parseInt(result.rows[0].downvotes || 0)
      };
    } catch (error) {
      console.error('Error fetching post vote counts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get vote counts for a solution
  static async getSolutionVoteCounts(solutionId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes
        FROM public.solution_votes 
        WHERE solution_id = $1
      `;
      const result = await client.query(query, [solutionId]);
      
      return {
        upvotes: parseInt(result.rows[0].upvotes || 0),
        downvotes: parseInt(result.rows[0].downvotes || 0)
      };
    } catch (error) {
      console.error('Error fetching solution vote counts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Get vote counts for a comment
  static async getCommentVoteCounts(commentId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes
        FROM public.comment_votes 
        WHERE comment_id = $1
      `;
      const result = await client.query(query, [commentId]);
      
      return {
        upvotes: parseInt(result.rows[0].upvotes || 0),
        downvotes: parseInt(result.rows[0].downvotes || 0)
      };
    } catch (error) {
      console.error('Error fetching comment vote counts:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }
}

export default Vote;