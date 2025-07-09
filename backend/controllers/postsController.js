import Post from '../models/Post.js';

const postsController = {
  // Get feed posts
  async getFeed(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'hot',
        time = 'all',
        department = null,
        search = null
      } = req.query;

      const student_id = req.user?.student_id || null;
      const offset = (page - 1) * limit;

      const posts = await Post.getFeedPosts({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy: sort,
        timeRange: time,
        department_id: department ? parseInt(department) : null,
        search,
        student_id
      });

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: posts.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Vote on post
  async votePost(req, res) {
    try {
      const { post_id } = req.params;
      const { vote_type } = req.body; // -1, 0, or 1
      const { student_id } = req.user;

      // Fixed: Using standard ASCII hyphen-minus instead of Unicode minus
      if (![-1, 0, 1].includes(vote_type)) {
        return res.status(400).json({ message: 'Invalid vote type' });
      }

      const result = await Post.votePost(post_id, student_id, vote_type);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error voting on post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Save/unsave post
  async toggleSave(req, res) {
    try {
      const { post_id } = req.params;
      const { student_id } = req.user;

      const result = await Post.toggleSavePost(post_id, student_id);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error toggling save:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Track post view
  async trackView(req, res) {
    try {
      const { post_id } = req.params;
      await Post.incrementViewCount(post_id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking view:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default postsController;
