-- 1. Fix teams table foreign key to point to sub_events instead of events
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_event_id_fkey;
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_sub_event_id_fkey;
ALTER TABLE public.teams ADD CONSTRAINT teams_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.sub_events(id) ON DELETE CASCADE;

-- 2. Ensure team_members has status column
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending';

-- 3. Ensure teams has is_locked column
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- 4. Reload PostgREST schema cache so API sees the new columns
NOTIFY pgrst, 'reload schema';
