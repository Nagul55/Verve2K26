-- ==========================================
-- COMPLETE VERVE26 SUPABASE DATABASE SCHEMA
-- ==========================================
-- Run this entire script in your Supabase SQL Editor.

-- 1. Participants Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.participants (
    participant_id uuid PRIMARY KEY, -- matches auth.users.id
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    mobile text,
    college text,
    register_number text,
    department text,
    year_of_study text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Fests Table (The Main Event, e.g. "Verve26")
CREATE TABLE IF NOT EXISTS public.fests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  min_technical integer DEFAULT 1 NOT NULL,
  min_non_technical integer DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sub-Events Table (The tech/non-tech events inside the Fest)
CREATE TABLE IF NOT EXISTS public.sub_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fest_id uuid REFERENCES public.fests(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL, -- 'Technical' | 'Non-Technical'
  participation_type text DEFAULT 'Individual', -- 'Individual' | 'Team'
  min_candidates integer DEFAULT 1 NOT NULL,
  max_candidates integer DEFAULT 1 NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  capacity integer DEFAULT 50,
  image_type text,
  status text DEFAULT 'Pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Registrations Table (A participant registers for a Fest)
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid REFERENCES public.participants(participant_id) ON DELETE CASCADE NOT NULL,
  fest_id uuid REFERENCES public.fests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(participant_id, fest_id)
);

-- 5. Registration Sub-Events (The specific sub-events they chose)
CREATE TABLE IF NOT EXISTS public.registration_sub_events (
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  sub_event_id uuid REFERENCES public.sub_events(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (registration_id, sub_event_id)
);

-- 6. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    team_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    team_name text UNIQUE NOT NULL,
    sub_event_id uuid REFERENCES public.sub_events(id) ON DELETE CASCADE,
    leader_id uuid REFERENCES public.participants(participant_id) ON DELETE CASCADE,
    join_code text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id uuid REFERENCES public.teams(team_id) ON DELETE CASCADE,
    participant_id uuid REFERENCES public.participants(participant_id) ON DELETE CASCADE,
    role text DEFAULT 'Member', -- 'Leader' | 'Member'
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, participant_id)
);

-- ==========================================
-- DUMMY DATA FOR VERVE26
-- ==========================================
INSERT INTO public.fests (id, name, description, min_technical, min_non_technical)
VALUES ('00000000-0000-0000-0000-000000000001', 'Verve26', 'The Ultimate Tech and Cultural Fest', 1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.sub_events (fest_id, category, participation_type, title, description, date, time, location, capacity, image_type)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Technical', 'Individual', 'Code Clash', 'A competitive coding challenge for problem solvers.', 'Oct 15, 2026', '09:00 AM', 'Main Block', 100, 'code'),
('00000000-0000-0000-0000-000000000001', 'Technical', 'Team', 'InnovateX', 'Build innovative solutions for real-world problems.', 'Oct 16, 2026', '10:00 AM', 'Lab Complex', 50, 'innovate'),
('00000000-0000-0000-0000-000000000001', 'Non-Technical', 'Team', 'Treasure Hunt', 'Decode. Explore. Win.', 'Oct 17, 2026', '09:00 AM', 'Campus Grounds', 200, 'treasure'),
('00000000-0000-0000-0000-000000000001', 'Non-Technical', 'Individual', 'Open Mic', 'Showcase your hidden talents.', 'Oct 18, 2026', '02:00 PM', 'Auditorium', 80, null)
ON CONFLICT DO NOTHING;
