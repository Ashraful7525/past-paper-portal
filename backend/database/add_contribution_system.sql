-- Add new fields to users table for contribution system
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation_tier VARCHAR(20) DEFAULT 'Bronze';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_users_contribution ON public.users(contribution);
CREATE INDEX IF NOT EXISTS idx_users_reputation_tier ON public.users(reputation_tier);

-- Update existing users to have proper default values
UPDATE public.users 
SET 
  last_activity_date = CURRENT_DATE,
  current_streak = 0,
  longest_streak = 0,
  reputation_tier = 'Bronze'
WHERE last_activity_date IS NULL;