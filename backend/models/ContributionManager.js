import pool from '../config/db.js';

class ContributionManager {
  // Point system configuration
  static POINTS = {
    POST_CREATED: 5,
    SOLUTION_CREATED: 10,
    COMMENT_CREATED: 2,
    UPVOTE_RECEIVED: 3,
    DOWNVOTE_RECEIVED: -1,
    BOOKMARK_RECEIVED: 2,
    VIEW_RECEIVED: 0.1
  };

  // Reputation tier thresholds
  static REPUTATION_TIERS = {
    Bronze: { min: 0, max: 99 },
    Silver: { min: 100, max: 499 },
    Gold: { min: 500, max: 1499 },
    Platinum: { min: 1500, max: 4999 },
    Diamond: { min: 5000, max: Infinity }
  };

  // Quality multipliers
  static MULTIPLIERS = {
    VERIFIED_CONTENT: 2.0,
    APPROVED_SOLUTION: 1.5,
    FEATURED_POST: 1.5,
    STREAK_BONUS: 0.1 // 10% bonus per streak day (max 50%)
  };

  /**
   * Calculate reputation tier based on contribution points
   */
  static getReputationTier(points) {
    for (const [tier, range] of Object.entries(this.REPUTATION_TIERS)) {
      if (points >= range.min && points <= range.max) {
        return tier;
      }
    }
    return 'Bronze';
  }

  /**
   * Calculate streak bonus multiplier (max 50% bonus)
   */
  static getStreakMultiplier(streakDays) {
    const maxBonus = 0.5; // 50% max bonus
    const bonusMultiplier = Math.min(streakDays * this.MULTIPLIERS.STREAK_BONUS, maxBonus);
    return 1 + bonusMultiplier;
  }

  /**
   * Update user's activity streak
   */
  static async updateUserStreak(studentId, client = null) {
    const shouldCloseConnection = !client;
    if (!client) {
      client = await pool.connect();
    }

    try {
      // Get current user data
      const userQuery = 'SELECT last_activity_date, current_streak, longest_streak FROM users WHERE student_id = $1';
      const userResult = await client.query(userQuery, [studentId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const lastActivity = user.last_activity_date ? user.last_activity_date.toISOString().split('T')[0] : null;
      
      let newStreak = user.current_streak || 0;
      let newLongestStreak = user.longest_streak || 0;

      if (!lastActivity || lastActivity !== today) {
        // Check if this continues a streak (yesterday) or breaks it
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day - continue streak
            newStreak += 1;
          } else if (diffDays > 1) {
            // Gap in activity - reset streak
            newStreak = 1;
          }
          // If diffDays === 0, it's the same day, don't increment
        } else {
          // First activity ever
          newStreak = 1;
        }

        // Update longest streak if current streak is longer
        newLongestStreak = Math.max(newStreak, newLongestStreak);

        // Update user's streak data
        await client.query(
          'UPDATE users SET last_activity_date = $1, current_streak = $2, longest_streak = $3 WHERE student_id = $4',
          [today, newStreak, newLongestStreak, studentId]
        );
      }

      return { currentStreak: newStreak, longestStreak: newLongestStreak };
    } finally {
      if (shouldCloseConnection) {
        client.release();
      }
    }
  }

  /**
   * Award points for content creation
   */
  static async awardContentCreationPoints(studentId, contentType, isVerified = false, isApproved = false, isFeatured = false, client = null) {
    const shouldCloseConnection = !client;
    if (!client) {
      client = await pool.connect();
      await client.query('BEGIN');
    }

    try {
      let basePoints = 0;
      switch (contentType) {
        case 'post':
          basePoints = this.POINTS.POST_CREATED;
          break;
        case 'solution':
          basePoints = this.POINTS.SOLUTION_CREATED;
          break;
        case 'comment':
          basePoints = this.POINTS.COMMENT_CREATED;
          break;
        default:
          throw new Error('Invalid content type');
      }

      // Apply quality multipliers
      let multiplier = 1;
      if (isVerified) multiplier *= this.MULTIPLIERS.VERIFIED_CONTENT;
      if (isApproved) multiplier *= this.MULTIPLIERS.APPROVED_SOLUTION;
      if (isFeatured) multiplier *= this.MULTIPLIERS.FEATURED_POST;

      // Update streak and get streak multiplier
      const streakData = await this.updateUserStreak(studentId, client);
      const streakMultiplier = this.getStreakMultiplier(streakData.currentStreak);
      
      // Calculate final points
      const finalPoints = Math.round(basePoints * multiplier * streakMultiplier);

      // Update user's contribution and reputation tier
      await this.updateUserContribution(studentId, finalPoints, client);

      if (shouldCloseConnection) {
        await client.query('COMMIT');
      }

      return { pointsAwarded: finalPoints, streakBonus: streakMultiplier - 1 };
    } catch (error) {
      if (shouldCloseConnection) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (shouldCloseConnection) {
        client.release();
      }
    }
  }

  /**
   * Award points for receiving engagement (upvotes, bookmarks, etc.)
   */
  static async awardEngagementPoints(studentId, engagementType, count = 1, client = null) {
    const shouldCloseConnection = !client;
    if (!client) {
      client = await pool.connect();
      await client.query('BEGIN');
    }

    try {
      let pointsPerAction = 0;
      switch (engagementType) {
        case 'upvote':
          pointsPerAction = this.POINTS.UPVOTE_RECEIVED;
          break;
        case 'downvote':
          pointsPerAction = this.POINTS.DOWNVOTE_RECEIVED;
          break;
        case 'bookmark':
          pointsPerAction = this.POINTS.BOOKMARK_RECEIVED;
          break;
        case 'view':
          pointsPerAction = this.POINTS.VIEW_RECEIVED;
          break;
        default:
          throw new Error('Invalid engagement type');
      }

      const totalPoints = Math.round(pointsPerAction * count);
      
      // Update user's contribution (engagement doesn't update streak)
      await this.updateUserContribution(studentId, totalPoints, client);

      if (shouldCloseConnection) {
        await client.query('COMMIT');
      }

      return { pointsAwarded: totalPoints };
    } catch (error) {
      if (shouldCloseConnection) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (shouldCloseConnection) {
        client.release();
      }
    }
  }

  /**
   * Update user's total contribution and reputation tier
   */
  static async updateUserContribution(studentId, pointsToAdd, client = null) {
    const shouldCloseConnection = !client;
    if (!client) {
      client = await pool.connect();
    }

    try {
      // Get current contribution
      const currentQuery = 'SELECT contribution FROM users WHERE student_id = $1';
      const currentResult = await client.query(currentQuery, [studentId]);
      
      if (currentResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentContribution = currentResult.rows[0].contribution || 0;
      const newContribution = Math.max(0, currentContribution + pointsToAdd); // Prevent negative contribution
      const newTier = this.getReputationTier(newContribution);

      // Update contribution and tier
      await client.query(
        'UPDATE users SET contribution = $1, reputation_tier = $2, updated_at = NOW() WHERE student_id = $3',
        [newContribution, newTier, studentId]
      );

      return { newContribution, newTier, pointsAdded: pointsToAdd };
    } finally {
      if (shouldCloseConnection) {
        client.release();
      }
    }
  }

  /**
   * Get user's contribution summary
   */
  static async getUserContributionSummary(studentId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          u.contribution,
          u.reputation_tier,
          u.current_streak,
          u.longest_streak,
          u.last_activity_date,
          (SELECT COUNT(*) FROM posts WHERE student_id = $1) as posts_count,
          (SELECT COUNT(*) FROM solutions WHERE student_id = $1) as solutions_count,
          (SELECT COUNT(*) FROM comments WHERE student_id = $1) as comments_count,
          (SELECT COALESCE(SUM(upvotes)::INTEGER, 0) FROM posts WHERE student_id = $1) as total_post_upvotes,
          (SELECT COALESCE(SUM(upvotes)::INTEGER, 0) FROM solutions WHERE student_id = $1) as total_solution_upvotes,
          (SELECT COALESCE(SUM(upvotes)::INTEGER, 0) FROM comments WHERE student_id = $1) as total_comment_upvotes
        FROM users u
        WHERE u.student_id = $1
      `;
      
      const result = await client.query(query, [studentId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const data = result.rows[0];
      
      // Ensure all numeric values are properly parsed as integers
      const cleanData = {
        ...data,
        posts_count: parseInt(data.posts_count || 0),
        solutions_count: parseInt(data.solutions_count || 0),
        comments_count: parseInt(data.comments_count || 0),
        total_post_upvotes: parseInt(data.total_post_upvotes || 0),
        total_solution_upvotes: parseInt(data.total_solution_upvotes || 0),
        total_comment_upvotes: parseInt(data.total_comment_upvotes || 0),
        contribution: parseInt(data.contribution || 0),
        current_streak: parseInt(data.current_streak || 0),
        longest_streak: parseInt(data.longest_streak || 0)
      };
      
      const tierInfo = this.REPUTATION_TIERS[cleanData.reputation_tier];
      const nextTier = this.getNextTier(cleanData.reputation_tier);
      
      return {
        ...cleanData,
        tier_info: tierInfo,
        next_tier: nextTier,
        progress_to_next_tier: nextTier ? 
          Math.round(((cleanData.contribution - tierInfo.min) / (nextTier.threshold - tierInfo.min)) * 100) : 100
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get next reputation tier information
   */
  static getNextTier(currentTier) {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const currentIndex = tiers.indexOf(currentTier);
    
    if (currentIndex < tiers.length - 1) {
      const nextTierName = tiers[currentIndex + 1];
      return {
        name: nextTierName,
        threshold: this.REPUTATION_TIERS[nextTierName].min
      };
    }
    
    return null; // Already at highest tier
  }

  /**
   * Recalculate contribution for a user (for admin or data fixes)
   */
  static async recalculateUserContribution(studentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate total contribution from all sources
      const calculationQuery = `
        SELECT 
          -- Content creation points
          (SELECT COUNT(*) * ${this.POINTS.POST_CREATED} FROM posts WHERE student_id = $1) +
          (SELECT COUNT(*) * ${this.POINTS.SOLUTION_CREATED} FROM solutions WHERE student_id = $1) +
          (SELECT COUNT(*) * ${this.POINTS.COMMENT_CREATED} FROM comments WHERE student_id = $1) +
          -- Engagement points
          (SELECT COALESCE(SUM(upvotes), 0) * ${this.POINTS.UPVOTE_RECEIVED} FROM posts WHERE student_id = $1) +
          (SELECT COALESCE(SUM(upvotes), 0) * ${this.POINTS.UPVOTE_RECEIVED} FROM solutions WHERE student_id = $1) +
          (SELECT COALESCE(SUM(upvotes), 0) * ${this.POINTS.UPVOTE_RECEIVED} FROM comments WHERE student_id = $1) +
          (SELECT COALESCE(SUM(downvotes), 0) * ${this.POINTS.DOWNVOTE_RECEIVED} FROM posts WHERE student_id = $1) +
          (SELECT COALESCE(SUM(downvotes), 0) * ${this.POINTS.DOWNVOTE_RECEIVED} FROM solutions WHERE student_id = $1) +
          (SELECT COALESCE(SUM(downvotes), 0) * ${this.POINTS.DOWNVOTE_RECEIVED} FROM comments WHERE student_id = $1) +
          -- Bookmark points
          (SELECT COUNT(*) * ${this.POINTS.BOOKMARK_RECEIVED} FROM saved_posts sp 
           JOIN posts p ON sp.post_id = p.post_id WHERE p.student_id = $1) +
          (SELECT COUNT(*) * ${this.POINTS.BOOKMARK_RECEIVED} FROM bookmarks b 
           JOIN solutions s ON b.solution_id = s.solution_id WHERE s.student_id = $1)
        AS total_points
      `;

      const result = await client.query(calculationQuery, [studentId]);
      const totalPoints = Math.max(0, Math.round(result.rows[0].total_points || 0));
      const newTier = this.getReputationTier(totalPoints);

      // Update user's contribution
      await client.query(
        'UPDATE users SET contribution = $1, reputation_tier = $2, updated_at = NOW() WHERE student_id = $3',
        [totalPoints, newTier, studentId]
      );

      await client.query('COMMIT');
      return { recalculatedPoints: totalPoints, newTier };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default ContributionManager;