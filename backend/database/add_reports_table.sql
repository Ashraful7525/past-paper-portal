-- Migration script to add reports table for content reporting system
-- This script should be run against your PostgreSQL database

CREATE TABLE IF NOT EXISTS reports (
  report_id SERIAL PRIMARY KEY,
  reporter_student_id INTEGER NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'solution', 'comment')),
  content_id INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraint
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_student_id) REFERENCES users(student_id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate reports from same user for same content
  CONSTRAINT unique_user_content_report UNIQUE (reporter_student_id, content_type, content_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_student_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Add some comments for documentation
COMMENT ON TABLE reports IS 'User reports for suspicious or inappropriate content';
COMMENT ON COLUMN reports.content_type IS 'Type of content being reported: question, solution, or comment';
COMMENT ON COLUMN reports.content_id IS 'ID of the specific content being reported';
COMMENT ON COLUMN reports.reason IS 'Predefined reason for the report (e.g., spam, inappropriate, false_info)';
COMMENT ON COLUMN reports.description IS 'Optional additional details from the reporter';
COMMENT ON COLUMN reports.status IS 'Current status: pending, resolved, or dismissed';
COMMENT ON COLUMN reports.admin_notes IS 'Notes added by admin when resolving the report';
