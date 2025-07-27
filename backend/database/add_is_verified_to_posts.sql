-- Migration script to add is_verified field to posts table
-- This script should be run against your PostgreSQL database

-- Add is_verified column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Add index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_posts_is_verified ON public.posts(is_verified);

-- Add some comments for documentation
COMMENT ON COLUMN public.posts.is_verified IS 'Whether the post has been verified by an admin';

-- Optionally, you can update existing posts to be verified if needed
-- UPDATE public.posts SET is_verified = true WHERE created_at < NOW() - INTERVAL '7 days';
