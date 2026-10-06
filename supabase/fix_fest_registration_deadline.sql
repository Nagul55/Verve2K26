-- ==============================================================================
-- EVENTRIX (Verve2K26) - FEST REGISTRATION DEADLINE SCHEMA MIGRATION
-- ==============================================================================
-- Purpose: Add canonical `registration_closes_at` TIMESTAMPTZ column to `public.fests`
-- Instructions: Run this query in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Add canonical TIMESTAMPTZ column for Fest registration deadline
ALTER TABLE public.fests 
ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;

-- 2. Grant permissions to service_role and authenticated users
GRANT ALL ON TABLE public.fests TO service_role;
GRANT SELECT ON TABLE public.fests TO anon, authenticated;

-- 3. Notify PostgREST to refresh its schema cache immediately
NOTIFY pgrst, 'reload schema';
