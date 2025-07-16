import pool from '../config/db.js';

class Vote {
  // Post voting methods
  static async votePost(postId, studentId, voteType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if post exists
      const postCheck = await client.query(
        'SELECT post_id FROM public.posts WHERE post_id = $1',
        [postId]
      );

      if (postCheck.rows.length === 0) {
        throw new Error('Post does not exist');
      }

      // Check if user already voted
      const existingVote = await client.query(
        'SELECT vote_type FROM public.post_votes WHERE post_id = $1 AND student_id = $2',
        [postId, studentId]
      );

      let oldVoteType = 0;
      if (existingVote.rows.length > 0) {
        oldVoteType = existingVote.rows[0].vote_type;
      }

      // Handle vote toggling: if same vote type, remove it (set to 0)
      if (oldVoteType === voteType && voteType !== 0) {
        voteType = 0;
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
          INSERT INTO public.post_votes (post_id, student_id, vote_type, created_at)
          VALUES ($1, $2, $3, NOW())
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
    console.log('🗳️  [VOTE MODEL] Starting voteSolution process:', { solutionId, studentId, voteType });
    
    try {
      await client.query('BEGIN');
      console.log('✅ [VOTE MODEL] Transaction started');

      // Check if solution exists
      console.log('🔍 [VOTE MODEL] Checking if solution exists...');
      const solutionCheck = await client.query(
        'SELECT solution_id FROM public.solutions WHERE solution_id = $1',
        [solutionId]
      );

      if (solutionCheck.rows.length === 0) {
        console.error('❌ [VOTE MODEL] Solution not found:', solutionId);
        throw new Error('Solution does not exist');
      }
      console.log('✅ [VOTE MODEL] Solution exists');

      // Check if user already voted
      console.log('🔍 [VOTE MODEL] Checking existing vote...');
      const existingVote = await client.query(
        'SELECT vote_type FROM public.solution_votes WHERE solution_id = $1 AND student_id = $2',
        [solutionId, studentId]
      );

      let oldVoteType = 0;
      if (existingVote.rows.length > 0) {
        oldVoteType = existingVote.rows[0].vote_type;
        console.log('📊 [VOTE MODEL] Existing vote found:', oldVoteType);
      } else {
        console.log('📊 [VOTE MODEL] No existing vote');
      }

      // Handle vote toggling: if same vote type, remove it (set to 0)
      if (oldVoteType === voteType && voteType !== 0) {
        console.log('🔄 [VOTE MODEL] Toggling vote off (same vote type)');
        voteType = 0;
      }

      if (voteType === 0) {
        // Remove vote
        console.log('🗑️  [VOTE MODEL] Removing vote...');
        const deleteResult = await client.query(
          'DELETE FROM public.solution_votes WHERE solution_id = $1 AND student_id = $2',
          [solutionId, studentId]
        );
        console.log('✅ [VOTE MODEL] Vote removed, rows affected:', deleteResult.rowCount);
      } else {
        // Insert or update vote
        console.log('💾 [VOTE MODEL] Inserting/updating vote...');
        const insertResult = await client.query(`
          INSERT INTO public.solution_votes (solution_id, student_id, vote_type, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (solution_id, student_id) 
          DO UPDATE SET vote_type = $3, created_at = NOW()
          RETURNING vote_id, vote_type
        `, [solutionId, studentId, voteType]);
        console.log('✅ [VOTE MODEL] Vote inserted/updated:', insertResult.rows[0]);
      }

      // Update solution upvotes/downvotes counts
      console.log('📊 [VOTE MODEL] Calculating vote counts...');
      const voteCountQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
        FROM public.solution_votes 
        WHERE solution_id = $1
      `;
      const voteCountResult = await client.query(voteCountQuery, [solutionId]);
      const { upvotes, downvotes } = voteCountResult.rows[0];
      console.log('📊 [VOTE MODEL] Vote counts:', { upvotes, downvotes });

      console.log('📊 [VOTE MODEL] Updating solution vote counts...');
      const updateResult = await client.query(
        'UPDATE public.solutions SET upvotes = $1, downvotes = $2 WHERE solution_id = $3 RETURNING upvotes, downvotes',
        [upvotes, downvotes, solutionId]
      );
      console.log('✅ [VOTE MODEL] Solution updated:', updateResult.rows[0]);

      await client.query('COMMIT');
      console.log('✅ [VOTE MODEL] Transaction committed');

      const result = {
        upvotes: parseInt(upvotes),
        downvotes: parseInt(downvotes),
        net_votes: parseInt(upvotes) - parseInt(downvotes),
        userVote: voteType
      };

      console.log('✅ [VOTE MODEL] Vote process completed successfully:', result);
      return result;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ [VOTE MODEL] Transaction rolled back due to error:', {
        error: error.message,
        stack: error.stack,
        solutionId,
        studentId,
        voteType
      });
      throw new Error('Failed to vote on solution');
    } finally {
      client.release();
      console.log('🔚 [VOTE MODEL] Database connection released');
    }
  }

  // Comment voting methods
  static async voteComment(commentId, studentId, voteType) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if comment exists
      const commentCheck = await client.query(
        'SELECT comment_id FROM public.comments WHERE comment_id = $1',
        [commentId]
      );

      if (commentCheck.rows.length === 0) {
        throw new Error('Comment does not exist');
      }

      // Check if user already voted
      const existingVote = await client.query(
        'SELECT vote_type FROM public.comment_votes WHERE comment_id = $1 AND student_id = $2',
        [commentId, studentId]
      );

      let oldVoteType = 0;
      if (existingVote.rows.length > 0) {
        oldVoteType = existingVote.rows[0].vote_type;
      }

      // Handle vote toggling: if same vote type, remove it (set to 0)
      if (oldVoteType === voteType && voteType !== 0) {
        voteType = 0;
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
          INSERT INTO public.comment_votes (comment_id, student_id, vote_type, created_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (comment_id, student_id) 
          DO UPDATE SET vote_type = $3, created_at = NOW()
        `, [commentId, studentId, voteType]);
      }

      // Update comment upvotes/downvotes counts
      const voteCountQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
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
        net_votes: parseInt(upvotes) - parseInt(downvotes),
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
      
      return result.rows.length > 0 ? result.rows[0].vote_type : 0;
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
      
      return result.rows.length > 0 ? result.rows[0].vote_type : 0;
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
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
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
          COUNT(*) FILTER (WHERE vote_type = 1) as upvotes,
          COUNT(*) FILTER (WHERE vote_type = -1) as downvotes
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