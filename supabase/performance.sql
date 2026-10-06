-- ====================================================================
-- EVENTRIX (VERVE2K26) - DATABASE PERFORMANCE OPTIMIZATION SCRIPT
-- Safe to run multiple times in Supabase SQL Editor / Postgres
-- ====================================================================

-- 1. INDEXES FOR HIGH-TRAFFIC QUERIES, JOIN CLAUSES & FOREIGN KEYS

-- Registrations & Attendance Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_participant ON registrations(event_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_reg_sub_events_sub_event_id ON registration_sub_events(sub_event_id);
CREATE INDEX IF NOT EXISTS idx_reg_sub_events_registration_id ON registration_sub_events(registration_id);

CREATE INDEX IF NOT EXISTS idx_attendance_registration_id ON attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant_id ON attendance(participant_id);

-- Sub-Events & Fests Filtering & Ordering Indexes
CREATE INDEX IF NOT EXISTS idx_sub_events_fest_id ON sub_events(fest_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_status ON sub_events(status);
CREATE INDEX IF NOT EXISTS idx_sub_events_created_at ON sub_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fests_created_at ON fests(created_at DESC);

-- Teams & Team Members Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_participant_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_participant_id ON team_members(participant_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);


-- 2. RLS POLICY OPTIMIZATIONS (SELECT AUTH.UID() SUBQUERY PATTERN)
-- Wrapping auth.uid() in (SELECT auth.uid()) allows Postgres to evaluate
-- auth context ONCE per query instead of re-executing on every row.

-- Participant Profile Read Policy
DROP POLICY IF EXISTS "Users can read own profile" ON participants;
CREATE POLICY "Users can read own profile" ON participants
  FOR SELECT
  USING (participant_id = (SELECT auth.uid()));

-- Participant Profile Update Policy
DROP POLICY IF EXISTS "Users can update own profile" ON participants;
CREATE POLICY "Users can update own profile" ON participants
  FOR UPDATE
  USING (participant_id = (SELECT auth.uid()));

-- Registrations Read Policy
DROP POLICY IF EXISTS "Participants can view own registrations" ON registrations;
CREATE POLICY "Participants can view own registrations" ON registrations
  FOR SELECT
  USING (participant_id = (SELECT auth.uid()));

-- Team Members Read Policy
DROP POLICY IF EXISTS "Team members can view their teams" ON team_members;
CREATE POLICY "Team members can view their teams" ON team_members
  FOR SELECT
  USING (participant_id = (SELECT auth.uid()));


-- 3. EXPLAIN ANALYZE PROFILING FOR TOP 3 HEAVIEST QUERIES

/*
-- HEAVY QUERY 1: Participant Ticket & Registration Roster Query
EXPLAIN ANALYZE
SELECT 
  r.id,
  f.id AS fest_id,
  f.name AS fest_name,
  se.id AS sub_event_id,
  se.title,
  se.category,
  se.date,
  se.location
FROM registrations r
JOIN fests f ON r.fest_id = f.id
JOIN registration_sub_events rse ON rse.registration_id = r.id
JOIN sub_events se ON rse.sub_event_id = se.id
WHERE r.participant_id = '00000000-0000-0000-0000-000000000000';

-- HEAVY QUERY 2: Coordinator Ticket Scanning & Attendance Verification Query
EXPLAIN ANALYZE
SELECT 
  rse.sub_event_id,
  r.id AS registration_id,
  p.full_name,
  p.email,
  a.id AS attendance_id,
  a.checked_in_at
FROM registration_sub_events rse
JOIN registrations r ON rse.registration_id = r.id
JOIN participants p ON r.participant_id = p.participant_id
LEFT JOIN attendance a ON a.registration_id = r.id AND a.event_id = rse.sub_event_id
WHERE rse.sub_event_id = '00000000-0000-0000-0000-000000000000';

-- HEAVY QUERY 3: Team Roster & Invitations Query
EXPLAIN ANALYZE
SELECT 
  tm.team_id,
  t.team_name,
  t.event_id,
  t.leader_participant_id,
  tm.participant_id,
  tm.status,
  p.full_name,
  p.email
FROM team_members tm
JOIN teams t ON tm.team_id = t.team_id
JOIN participants p ON tm.participant_id = p.participant_id
WHERE tm.participant_id = '00000000-0000-0000-0000-000000000000';
*/
