import Post from '../models/Post.js';
import Solution from '../models/Solution.js';
import Vote from '../models/Vote.js';
import Bookmark from '../models/Bookmark.js';
import Stats from '../models/Stats.js';

const postsController = {
  // Get feed posts
  async getFeed(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'hot', 
        timeRange = 'all',
        department_id = null,
        search = null 
      } = req.query;
      
      const student_id = req.user?.student_id || null;
      const offset = (page - 1) * limit;

      console.log('Feed request params:', { 
        page, limit, sortBy, timeRange, department_id, search, student_id 
      });

      const posts = await Post.getFeedPosts({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        timeRange,
        department_id: department_id ? parseInt(department_id) : null,
        search,
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
      const { content } = req.body;
      const { student_id } = req.user;

      console.log('Adding solution:', { post_id, content, student_id });

      // Validate post_id
      if (!post_id || isNaN(parseInt(post_id))) {
        return res.status(400).json({ 
          message: 'Invalid post ID' 
        });
      }

      // Validate content
      if (!content || content.trim() === '') {
        return res.status(400).json({ 
          message: 'Solution content is required' 
        });
      }

      const solution = await Solution.addSolution(parseInt(post_id), student_id, content.trim());
      
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