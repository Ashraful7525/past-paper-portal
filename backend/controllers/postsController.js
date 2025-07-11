import Post from '../models/Post.js';

const postsController = {
  // Get feed posts
  async getFeed(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'hot',
        time = 'all'
      } = req.query;
      let { search = null, department = null } = req.query;

      // Sanitize search and department parameters
      if (search === 'null' || search === '' || search === 'undefined') {
        search = null;
      }
      if (department === 'null' || department === '') {
        department = null;
      }

      const student_id = req.user?.student_id || null;
      const offset = (page - 1) * limit;

      console.log('Fetching feed with params:', {
        page,
        limit,
        sort,
        time,
        department,
        search,
        student_id
      });

      const posts = await Post.getFeedPosts({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy: sort,
        timeRange: time,
        department_id: department ? parseInt(department) : null,
        search,
        student_id
      });

      // Get department stats for sidebar
      const departmentStats = await Post.getDepartmentStats();
      
      // Get global stats
      const globalStats = await Post.getGlobalStats();

      res.json({
        posts,
        departments: departmentStats,
        globalStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: posts.length === parseInt(limit),
          total: posts.length
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

  // Vote on post
  async votePost(req, res) {
    try {
      const { post_id } = req.params;
      const { vote_type } = req.body;
      const { student_id } = req.user;

      console.log('Vote request:', { post_id, vote_type, student_id });

      // Validate vote type
      if (![-1, 0, 1].includes(vote_type)) {
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

      const result = await Post.votePost(parseInt(post_id), student_id, vote_type);
      
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

      const result = await Post.toggleSavePost(parseInt(post_id), student_id);
      
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

      await Post.incrementViewCount(parseInt(post_id));
      
      res.json({ 
        success: true, 
        message: 'View tracked successfully' 
      });
    } catch (error) {
      console.error('Error tracking view:', error);
      
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

  // Get departments (for sidebar)
  async getDepartments(req, res) {
    try {
      const departments = await Post.getDepartmentStats();
      res.json({ departments });
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
      const stats = await Post.getGlobalStats();
      res.json({ stats });
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