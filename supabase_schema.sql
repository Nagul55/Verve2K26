-- Run this in your Supabase SQL Editor

-- 1. Create Fests table
CREATE TABLE public.fests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  min_technical integer DEFAULT 1 NOT NULL,
  min_non_technical integer DEFAULT 1 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Sub-Events table
CREATE TABLE public.sub_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fest_id uuid REFERENCES public.fests(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL, -- 'Technical' | 'Non-Technical'
  title text NOT NULL,
  description text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  image_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Registrations table
CREATE TABLE public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL, -- e.g., auth user ID
  fest_id uuid REFERENCES public.fests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create junction table for many-to-many relationship (Registration <-> SubEvent)
CREATE TABLE public.registration_sub_events (
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  sub_event_id uuid REFERENCES public.sub_events(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (registration_id, sub_event_id)
);

-- Row Level Security (RLS) Policies (Enable if using Supabase Auth)
-- ALTER TABLE public.fests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sub_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.registration_sub_events ENABLE ROW LEVEL SECURITY;

-- Insert some dummy data for Verve26 so the dashboard isn't empty!
INSERT INTO public.fests (id, name, description, min_technical, min_non_technical)
VALUES ('00000000-0000-0000-0000-000000000001', 'Verve26', 'The Ultimate Tech and Cultural Fest', 1, 1);

INSERT INTO public.sub_events (fest_id, category, title, description, date, time, location, image_type)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Technical', 'Code Clash', 'A competitive coding challenge for problem solvers.', 'Oct 15, 2026', '09:00 AM', 'Main Block', 'code'),
('00000000-0000-0000-0000-000000000001', 'Technical', 'InnovateX', 'Build innovative solutions for real-world problems.', 'Oct 16, 2026', '10:00 AM', 'Lab Complex', 'innovate'),
('00000000-0000-0000-0000-000000000001', 'Non-Technical', 'Treasure Hunt', 'Decode. Explore. Win.', 'Oct 17, 2026', '09:00 AM', 'Campus Grounds', 'treasure'),
('00000000-0000-0000-0000-000000000001', 'Non-Technical', 'Open Mic', 'Showcase your hidden talents.', 'Oct 18, 2026', '02:00 PM', 'Auditorium', null);
