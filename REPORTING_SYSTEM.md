# User Reporting System Implementation

## Overview
A comprehensive content reporting system has been implemented to allow users to report suspicious or inappropriate content (questions, solutions, and comments). This system includes both user-facing reporting capabilities and admin moderation tools.

## Backend Implementation

### Database Schema
**New Table: `reports`**
- `report_id` (SERIAL PRIMARY KEY)
- `reporter_student_id` (INTEGER, FK to users table)
- `content_type` (VARCHAR, CHECK: 'question', 'solution', 'comment')
- `content_id` (INTEGER, ID of the reported content)
- `reason` (VARCHAR, predefined reason codes)
- `description` (TEXT, optional additional details)
- `status` (VARCHAR, CHECK: 'pending', 'resolved', 'dismissed')
- `admin_notes` (TEXT, admin's notes when resolving)
- `created_at` (TIMESTAMP)
- `resolved_at` (TIMESTAMP)

**Constraints:**
- Unique constraint prevents duplicate reports from same user for same content
- Foreign key cascades when user is deleted
- Performance indexes on status, content type/id, reporter, and creation date

### Models
**`Report.js`** - New model with methods:
- `createReport()` - Submit new report with duplicate prevention
- `getAllReports()` - Get reports for admin with filtering
- `getReportsByContent()` - Get reports count for specific content
- `updateReportStatus()` - Update status (resolve/dismiss)
- `getReportStats()` - Statistics for admin dashboard
- `deleteReport()` - Remove report entirely

### Controllers
**`reportsController.js`** - User-facing endpoints:
- `POST /api/reports` - Submit new report
- `GET /api/reports/:contentType/:contentId` - Check if content has reports
- `GET /api/reports/check/:contentType/:contentId` - Check user's report status

**`adminController.js`** - Enhanced with report management:
- `GET /admin/reports` - Get all reports with filtering
- `PUT /admin/reports/:id` - Update report status
- `DELETE /admin/reports/:id` - Delete report
- `GET /admin/reports/stats` - Report statistics

### Routes
**`routes/reports.js`** - User reporting routes with authentication
**`routes/admin.js`** - Enhanced with admin report management routes

## Frontend Implementation

### Components

**`ReportModal.jsx`** - Comprehensive reporting interface:
- Content-specific reason categories (different for questions/solutions/comments)
- Form validation and submission
- Duplicate report prevention
- User-friendly error handling
- Accessibility features (focus management, ARIA labels)

**Enhanced existing components:**
- **`PostHeader.jsx`** - Added report button for questions
- **`SolutionCard.jsx`** - Added report button for solutions  
- **`CommentCard.jsx`** - Added report button for comments

### Admin Dashboard
**Enhanced `AdminDashboard.jsx`:**
- New "Reports" tab in navigation
- Report listing with content type indicators
- Action buttons: Resolve, Dismiss, Delete
- Real-time updates after actions
- Loading states and empty states

### Report Categories

**Questions:**
- Inappropriate Content
- Spam or Promotional
- False Information
- Copyright Violation
- Duplicate Question
- Off Topic
- Other

**Solutions:**
- Incorrect Solution
- Inappropriate Content
- Spam or Promotional
- Plagiarism
- Misleading Information
- Off Topic
- Other

**Comments:**
- Inappropriate Language
- Harassment or Bullying
- Spam or Promotional
- False Information
- Off Topic
- Personal Attack
- Other

## Security Features

1. **Authentication Required**: All reporting requires logged-in users
2. **Duplicate Prevention**: Users cannot report same content multiple times
3. **Input Validation**: Server-side validation of content types and reasons
4. **Admin-Only Access**: Report moderation restricted to admin users
5. **Rate Limiting**: Existing rate limiting applies to report endpoints

## User Experience

### For Regular Users:
- Discrete flag icons on content
- Modal interface with clear categories
- Optional description field for additional context
- Success/error feedback with toast notifications
- Prevents multiple reports of same content

### For Administrators:
- Dedicated reports tab in admin dashboard
- Clear content type indicators
- Report reason badges
- Content preview with reporter/author info
- Bulk actions for efficient moderation
- Status tracking (pending/resolved/dismissed)

## API Endpoints

### User Endpoints
```
POST   /api/reports                     - Submit report
GET    /api/reports/:type/:id          - Get report count for content
GET    /api/reports/check/:type/:id    - Check user's report status
```

### Admin Endpoints
```
GET    /admin/reports                  - List all reports (with filters)
PUT    /admin/reports/:id              - Update report status
DELETE /admin/reports/:id              - Delete report
GET    /admin/reports/stats            - Report statistics
```

## Database Migration
Run the migration script at `backend/database/add_reports_table.sql` to create the reports table and indexes.

## Future Enhancements

1. **Email Notifications**: Notify admins of new reports
2. **Report Categories Analytics**: Track most common report reasons
3. **Auto-moderation**: Automatic actions based on report patterns
4. **User Reputation**: Impact user scores based on valid/invalid reports
5. **Content Flagging**: Automatic hiding of heavily reported content
6. **Report History**: Show users their report history
7. **Bulk Actions**: Admin tools for handling multiple reports
8. **Report Templates**: Pre-filled report forms for common issues

## Testing Checklist

- [ ] Users can report questions, solutions, and comments
- [ ] Duplicate reporting prevention works
- [ ] Admin can view, resolve, dismiss, and delete reports
- [ ] Report statistics display correctly
- [ ] Authentication and authorization work properly
- [ ] Database constraints prevent invalid data
- [ ] Error handling works for edge cases
- [ ] UI/UX is intuitive and accessible

The reporting system provides a comprehensive solution for content moderation while maintaining a clean, user-friendly interface for both regular users and administrators.
