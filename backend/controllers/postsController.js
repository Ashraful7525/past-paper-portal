import Post from '../models/Post.js';
import Solution from '../models/Solution.js';
import Vote from '../models/Vote.js';
import Bookmark from '../models/Bookmark.js';
import Stats from '../models/Stats.js';
import pool from '../config/db.js';

const postsController = {
  // Create a new post
  async createPost(req, res) {
    try {
      const { 
        title, 
        content, 
        preview_text, 
        department_id, 
        question_id, 
        file_url, 
        file_size 
      } = req.body;
      const { student_id } = req.user;

      console.log('Creating post:', { 
        title, content, preview_text, department_id, question_id, file_url, file_size, student_id 
      });

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({ 
          message: 'Title is required' 
        });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ 
          message: 'Content is required' 
        });
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        preview_text: preview_text ? preview_text.trim() : content.trim().substring(0, 200) + '...',
        file_url,
        file_size,
        student_id,
        department_id: department_id ? parseInt(department_id) : null,
        question_id: question_id ? parseInt(question_id) : null
      };

      const post = await Post.createPost(postData);
      
      res.status(201).json({ 
        success: true,
        message: 'Post created successfully',
        data: post 
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Create a new post with question
  async uploadPaper(req, res) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { 
        title, 
        content, 
        preview_text, 
        department_id, 
        file_url, 
        tags,
        questionData 
      } = req.body;
      const { student_id } = req.user;

      console.log('Creating question and post:', { 
        title, content, preview_text, department_id, file_url, tags, questionData, student_id 
      });

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({ 
          message: 'Title is required' 
        });
      }

      if (!questionData || !questionData.course_id || !questionData.semester_id || !questionData.year || !questionData.question_no) {
        return res.status(400).json({ 
          message: 'Question data is required (course, semester, year, question number)' 
        });
      }

      // First, create the question
      const questionQuery = `
        INSERT INTO public.questions (question_no, question_text, course_id, semester_id, year, uploaded_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING question_id
      `;

      const questionResult = await client.query(questionQuery, [
        questionData.question_no,
        questionData.question_text || '',
        questionData.course_id,
        questionData.semester_id,
        questionData.year,
        student_id
      ]);

      const question_id = questionResult.rows[0].question_id;

      // Then, create the post with the question_id
      const postQuery = `
        INSERT INTO public.posts (title, content, preview_text, file_url, student_id, department_id, question_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING post_id, title, content, preview_text, file_url, created_at, updated_at
      `;

      const postResult = await client.query(postQuery, [
        title.trim(),
        content ? content.trim() : '',
        preview_text ? preview_text.trim() : (content ? content.trim().substring(0, 200) + '...' : ''),
        file_url || null,
        student_id,
        department_id,
        question_id
      ]);

      const post = postResult.rows[0];

      // Handle tags if provided
      if (tags && tags.trim()) {
        const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        for (const tagName of tagNames) {
          // Insert tag if it doesn't exist
          const tagQuery = `
            INSERT INTO public.tags (tag_name, created_at)
            VALUES ($1, NOW())
            ON CONFLICT (tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name
            RETURNING tag_id
          `;
          
          const tagResult = await client.query(tagQuery, [tagName]);
          const tag_id = tagResult.rows[0].tag_id;
          
          // Link post to tag
          await client.query(
            `INSERT INTO public.post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [post.post_id, tag_id]
          );
        }
      }

      await client.query('COMMIT');
      
      res.status(201).json({ 
        success: true,
        message: 'Paper uploaded successfully',
        data: {
          post: post,
          question_id: question_id
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error uploading paper:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  },

  // Get feed posts
  async getFeed(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'hot', 
        timeRange = 'all',
        department_id = null,
        forYou = false,
        search = null,
        course_id = null,
        level = null,
        term = null,
        year = null,
        question_no = null
      } = req.query;
      
      const student_id = req.user?.student_id || null;
      const offset = (page - 1) * limit;

      console.log('Feed request params:', { 
        page, limit, sortBy, timeRange, department_id, forYou, search, course_id, level, term, year, question_no, student_id 
      });

      const posts = await Post.getFeedPosts({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        timeRange,
        department_id: department_id ? parseInt(department_id) : null,
        forYou: forYou === 'true',
        search,
        course_id: course_id ? parseInt(course_id) : null,
        level: level ? parseInt(level) : null,
        term: term ? parseInt(term) : null,
        year: year ? parseInt(year) : null,
        question_no: question_no ? parseInt(question_no) : null,
        student_id
      });

      const hasMore = posts.length === parseInt(limit);

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore
        }
      });
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get individual post details
  async getPost(req, res) {
    try {
      const { post_id } = req.params;
      const student_id = req.user?.student_id || null;

      console.log('Getting post details:', { post_id, student_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      const post = await Post.getPostById(parseInt(post_id), student_id);
      
      if (!post) {
        return res.status(404).json({ 
          message: 'Post not found' 
        });
      }

      res.json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get solutions for a post
  async getSolutions(req, res) {
    try {
      const { post_id } = req.params;
      const student_id = req.user?.student_id || null;

      console.log('Fetching solutions for post:', { post_id, student_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      const solutions = await Solution.getSolutionsByPostId(parseInt(post_id), student_id);
      
      res.json(solutions);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Add solution to a post
  async addSolution(req, res) {
    try {
      const { post_id } = req.params;
      const { content, file_url } = req.body;
      const { student_id } = req.user;

      console.log('Adding solution:', { post_id, content, file_url, student_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      // Validate that either content or file_url is provided
      if ((!content || content.trim() === '') && !file_url) {
        return res.status(400).json({ 
          message: 'Either solution content or file attachment is required' 
        });
      }

      const solution = await Solution.addSolution(parseInt(post_id), student_id, content.trim(), file_url);
      
      // Create notification for the post owner about new solution
      try {
        // Get post owner
        const postQuery = `SELECT student_id FROM posts WHERE post_id = $1`;
        const postResult = await pool.query(postQuery, [parseInt(post_id)]);
        
        if (postResult.rows.length > 0) {
          const postOwnerId = postResult.rows[0].student_id;
          
          // Import and create notification
          const Notification = (await import('../models/Notification.js')).default;
          await Notification.createSolutionNotification(
            postOwnerId, 
            student_id, 
            parseInt(post_id), 
            solution.solution_id
          );
        }
      } catch (notificationError) {
        console.error('Error creating solution notification:', notificationError);
        // Don't fail the solution creation if notification fails
      }
      
      res.status(201).json({ 
        success: true,
        message: 'Solution added successfully',
        data: solution 
      });
    } catch (error) {
      console.error('Error adding solution:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({ 
          message: 'Post not found' 
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Vote on post
  async votePost(req, res) {
    try {
      const { post_id } = req.params;
      const { voteType } = req.body;
      const { student_id } = req.user;

      console.log('Vote request:', { post_id, voteType, student_id });

      // Validate vote type
      if (![-1, 0, 1].includes(voteType)) {
        return res.status(400).json({ 
          message: 'Invalid vote type. Must be -1, 0, or 1' 
        });
      }

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      const result = await Vote.votePost(parseInt(post_id), student_id, voteType);
      
      // Create notification for vote (only for upvotes/downvotes, not for removing votes)
      if (voteType !== 0) {
        try {
          // Get post owner
          const postQuery = `SELECT student_id FROM posts WHERE post_id = $1`;
          const postResult = await pool.query(postQuery, [parseInt(post_id)]);
          
          if (postResult.rows.length > 0) {
            const postOwnerId = postResult.rows[0].student_id;
            
            // Import and create notification
            const Notification = (await import('../models/Notification.js')).default;
            await Notification.createVoteNotification(
              postOwnerId, 
              student_id, 
              parseInt(post_id), 
              voteType, 
              'post'
            );
          }
        } catch (notificationError) {
          console.error('Error creating vote notification:', notificationError);
          // Don't fail the vote if notification fails
        }
      }
      
      res.json({ 
        success: true, 
        message: 'Vote recorded successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error voting on post:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({ 
          message: 'Post not found' 
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Save/unsave post
  async toggleSave(req, res) {
    try {
      const { post_id } = req.params;
      const { student_id } = req.user;

      console.log('Toggle save request:', { post_id, student_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      const result = await Bookmark.toggleSavePost(parseInt(post_id), student_id);
      
      res.json({ 
        success: true, 
        message: result.isSaved ? 'Post saved successfully' : 'Post unsaved successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      
      if (error.message.includes('does not exist')) {
        return res.status(404).json({ 
          message: 'Post not found' 
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Track post view
  async trackView(req, res) {
    try {
      const { post_id } = req.params;

      console.log('Track view request:', { post_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      const result = await Post.incrementViewCount(parseInt(post_id));
      
      res.json({ 
        success: true, 
        message: 'View tracked successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error tracking view:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get available years for filtering
  async getAvailableYears(req, res) {
    try {
      const query = `
        SELECT DISTINCT q.year 
        FROM public.questions q
        WHERE q.year IS NOT NULL
        ORDER BY q.year DESC
      `;
      
      const result = await pool.query(query);
      const years = result.rows.map(row => row.year);
      
      res.json(years);
    } catch (error) {
      console.error('Error fetching available years:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get departments (for sidebar)
  async getDepartments(req, res) {
    try {
      const departments = await Stats.getDepartmentStats();
      res.json(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get global statistics
  async getStats(req, res) {
    try {
      const stats = await Stats.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default postsController;