-- Run this in your Supabase SQL Editor

-- 1. Add status to team members for invitation flow
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';

-- 2. Add is_locked to teams to prevent further changes once finalized
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- 3. Update existing records so the app doesn't break
UPDATE public.team_members SET status = 'Accepted' WHERE status = 'Pending';
