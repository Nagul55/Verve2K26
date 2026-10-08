-- Migration: Add allowed_departments to fests, and whatsapp_group_link to hackathons and sub_events
-- Date: 2026-10-08

-- 1. Add allowed_departments to fests table (comma-separated departments, e.g. "CSE, IT, AI & DS")
ALTER TABLE public.fests
  ADD COLUMN IF NOT EXISTS allowed_departments TEXT;

-- 2. Add whatsapp_group_link to hackathons table (e.g. "https://chat.whatsapp.com/...")
ALTER TABLE public.hackathons
  ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;

-- 3. Add whatsapp_group_link to sub_events table (e.g. "https://chat.whatsapp.com/...")
ALTER TABLE public.sub_events
  ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;
