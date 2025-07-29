# Activity Tracking Implementation

## Overview
This document outlines how active users are tracked in the Past Paper Portal admin dashboard, what's currently possible with the existing schema, and recommendations for enhancement.

## Current Implementation

### Active Users (Last 7 Days)
The system now tracks active users by considering multiple types of user activities:

**Tracked Activities:**
1. **Content Creation:**
   - Creating posts
   - Creating solutions
   - Making comments

2. **Engagement Activities:**
   - Voting on posts
   - Voting on solutions  
   - Voting on comments

3. **Discovery Activities:**
   - Bookmarking solutions
   - Bookmarking questions
   - Saving posts
   - Viewing questions (logged-in users only)

4. **Educational Activities:**
   - Enrolling in courses

### Database Tables Used
```sql
-- Content creation
posts.created_at
solutions.created_at
comments.created_at

-- Voting engagement
post_votes.created_at
solution_votes.created_at
comment_votes.created_at

-- Bookmarking/saving
bookmarks.created_at
question_bookmarks.created_at
saved_posts.created_at

-- Views and enrollment
question_views.created_at (where student_id IS NOT NULL)
enrollments.enrolled_at
```

## Schema Capabilities

### ✅ Available Activity Tracking
- **Post interactions** - Creation, voting, saving
- **Solution interactions** - Creation, voting, bookmarking
- **Comment interactions** - Creation, voting
- **Question interactions** - Viewing, bookmarking
- **Course interactions** - Enrollment
- **Timeline tracking** - All activities have timestamps

### ❌ Missing Activity Indicators
- **Login/Session tracking** - No login timestamps in users table
- **General page views** - No page view tracking beyond questions
- **Search activity** - No search query logs
- **Profile visits** - No profile view tracking
- **Download tracking** - Posts have download_count but no individual user tracking
- **Real-time presence** - No online/offline status

## Query Performance

### Current Query Structure
The active users query uses UNION to combine different activity types:
- Uses indexes on timestamp columns for performance
- DISTINCT eliminates duplicate users across activities
- Compares current 7 days vs previous 7 days for trend calculation

### Performance Considerations
- **Pros:** Comprehensive activity tracking
- **Cons:** Complex query with multiple UNIONs
- **Optimization:** Consider creating a dedicated `user_activities` table for better performance

## Recommendations for Enhancement

### 1. Add Session Tracking
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE;
```

### 2. Create Activity Log Table
```sql
CREATE TABLE user_activities (
  activity_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(student_id),
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'view', 'create', 'vote', etc.
  resource_type VARCHAR(50), -- 'post', 'solution', 'comment', etc.
  resource_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_user_activities_student_time ON user_activities(student_id, created_at);
CREATE INDEX idx_user_activities_type_time ON user_activities(activity_type, created_at);
```

### 3. Add Page View Tracking
```sql
CREATE TABLE page_views (
  view_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(student_id),
  page_type VARCHAR(50) NOT NULL,
  page_id INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Status

### ✅ Completed
- Multi-activity user tracking
- 7-day active user calculation
- Week-over-week trend analysis
- Integration with admin dashboard

### 🔄 In Progress
- Performance monitoring of complex query
- Data validation of activity counts

### 📋 Planned
- Session-based activity tracking
- Dedicated activity log implementation
- Real-time activity monitoring
- Activity-based user segmentation

## Admin Dashboard Integration

The enhanced active users metric now appears in:
1. **Overview Stats** - "Active Users (7d)" card
2. **System Health** - More accurate activity indicators
3. **Trend Analysis** - Week-over-week comparison

## Testing and Validation

To validate the active users count:
```sql
-- Test query to verify active users
WITH active_users_7d AS (
  SELECT DISTINCT student_id FROM (
    SELECT student_id FROM posts WHERE created_at >= NOW() - INTERVAL '7 days'
    UNION
    SELECT student_id FROM solutions WHERE created_at >= NOW() - INTERVAL '7 days'
    UNION
    SELECT student_id FROM comments WHERE created_at >= NOW() - INTERVAL '7 days'
    -- ... other activities
  ) AS all_activities
)
SELECT COUNT(*) as total_active_users FROM active_users_7d;
```

## Conclusion

The current schema provides sufficient data for comprehensive activity tracking. The implemented solution gives a much more accurate picture of user engagement compared to the previous posts-only approach. For future scalability, consider implementing the recommended activity log table for better performance and more detailed analytics.
