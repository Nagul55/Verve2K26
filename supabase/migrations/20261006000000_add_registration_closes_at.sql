-- ====================================================================
-- MIGRATION: ADD REGISTRATION_CLOSES_AT TO FESTS TABLE
-- Safe to run multiple times in Supabase SQL Editor
-- ====================================================================

ALTER TABLE public.fests
ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;

-- Comment describing the canonical registration deadline timestamp
COMMENT ON COLUMN public.fests.registration_closes_at IS 'Absolute timezone-aware timestamp (IST / UTC+05:30) when registration closes for all sub-events under this fest.';
