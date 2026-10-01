-- Verve26 Database - RLS Policies and Seed Data

-------------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-------------------------------------------------------------------------------
-- By default, Supabase allows anon access unless RLS is enabled. 
-- We must enable it to secure participant data.

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 2. RLS POLICIES
-------------------------------------------------------------------------------

-- EVENTS TABLE
-- Anyone (anon or authenticated) can view open events to register.
CREATE POLICY "Public can view events" 
ON events FOR SELECT 
USING (true);

-- Only authenticated Super Admins can insert/update/delete events
CREATE POLICY "Admins can manage events" 
ON events FOR ALL 
TO authenticated 
USING (auth.uid() IN (SELECT admin_id FROM admin_roles WHERE role = 'Super Admin'));

-- PARTICIPANTS & REGISTRATIONS
-- The public frontend (anon) must be able to INSERT registrations using a Service Role key or API route.
-- If you are using the anon key directly on the frontend for inserts:
CREATE POLICY "Public can insert participants" 
ON participants FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can insert registrations" 
ON event_registrations FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins and coordinators can view participant and registration data
CREATE POLICY "Admins can view participants" 
ON participants FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can view registrations" 
ON event_registrations FOR SELECT 
TO authenticated 
USING (true);

-- ATTENDANCE
-- Only authenticated users (Coordinators/Admins) can insert or view attendance
CREATE POLICY "Staff can manage attendance" 
ON attendance FOR ALL 
TO authenticated 
USING (true);


-------------------------------------------------------------------------------
-- 3. SEED DATA (The 8 Events)
-------------------------------------------------------------------------------
-- Inserting the 4 Technical and 4 Non-Technical events as required by the SRS.

INSERT INTO events (event_code, name, description, category, participation_type, capacity, status)
VALUES 
-- Technical Events (Exactly 2 required per participant)
('TECH-01', 'Code Odyssey (Hackathon)', 'A 24-hour coding marathon to solve real-world problems.', 'Technical', 'Team', 100, 'Open'),
('TECH-02', 'Robo Wars', 'Design and battle robots in the ultimate arena.', 'Technical', 'Team', 50, 'Open'),
('TECH-03', 'Bug Hunt', 'Find and fix complex bugs in legacy codebases.', 'Technical', 'Individual', 200, 'Open'),
('TECH-04', 'Tech Quiz', 'Test your knowledge on the latest in technology and computer science.', 'Technical', 'Individual', 300, 'Open'),

-- Non-Technical Events (Exactly 1 required per participant)
('NON-01', 'Battle of Bands', 'Live music competition for college bands.', 'Non-Technical', 'Team', 20, 'Open'),
('NON-02', 'Step Up (Dance Off)', 'Showcase your dance skills on the main stage.', 'Non-Technical', 'Team', 30, 'Open'),
('NON-03', 'Esports Tournament', 'Competitive gaming tournament (Valorant & BGMI).', 'Non-Technical', 'Team', 64, 'Open'),
('NON-04', 'Treasure Hunt', 'A campus-wide cryptic puzzle-solving adventure.', 'Non-Technical', 'Team', 100, 'Open');
