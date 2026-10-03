-- SQL Script: Add Team Min & Max Candidate Limits to sub_events table
-- Run this query in your Supabase SQL Editor:

ALTER TABLE public.sub_events 
ADD COLUMN IF NOT EXISTS min_candidates integer DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS max_candidates integer DEFAULT 1 NOT NULL;
