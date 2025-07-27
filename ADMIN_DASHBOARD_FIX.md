# Admin Dashboard Data Retrieval Fix

## Problem Identified
The admin dashboard was showing hardcoded sample data instead of real backend data because:

1. **Schema Mismatch**: The admin queries were looking for an `is_verified` field in the `posts` table that didn't exist
2. **Wrong Table References**: The Question model was querying the `questions` table instead of the `posts` table that the main application uses
3. **Fallback Sample Data**: The frontend had hardcoded sample data that was hiding the real issue

## Changes Made

### 1. Database Schema Update
- **File**: `backend/database/add_is_verified_to_posts.sql`
- **Change**: Added `is_verified` boolean field to `posts` table
- **Purpose**: Allow tracking of which posts need admin verification

### 2. Frontend Changes
- **File**: `frontend/src/pages/AdminDashboard.jsx`
- **Change**: Removed hardcoded sample data for questions, solutions, and comments
- **Purpose**: Now shows real backend data instead of fake data

### 3. Backend Model Updates
- **File**: `backend/models/Question.js`
- **Changes**:
  - Updated `getPendingQuestions()` to query `posts` table instead of `questions` table
  - Updated `approveQuestion()` to update `posts.is_verified` field
  - Updated `deleteQuestion()` to delete from `posts` table and related tables
- **Purpose**: Align queries with actual database schema used by the application

## Database Schema Relationships
```
posts (main questions/posts)
├── post_id (primary key)
├── title, content, student_id, department_id
├── is_verified (newly added)
└── question_id (references questions table)

solutions
├── solution_id (primary key)
├── question_id (references questions.question_id)
├── is_verified (existing field)
└── student_id, solution_text, etc.

comments
├── comment_id (primary key)
├── solution_id (references solutions.solution_id)
└── upvotes, downvotes for flagging logic
```

## Required Database Migration
Run this SQL to add the missing field:
```sql
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_posts_is_verified ON public.posts(is_verified);
```

## Expected Results
After these changes:
- Admin dashboard will show real pending posts (is_verified = false)
- Admin dashboard will show real pending solutions (is_verified = false) 
- Admin dashboard will show real flagged comments (negative vote scores)
- Approve/delete functions will work on actual data
- No more hardcoded sample data

## Testing
1. Create some posts in the main application
2. Check admin dashboard - they should appear as "pending questions"
3. Approve/delete posts from admin dashboard
4. Verify changes reflect in main application
