
-- ==========================================
-- VERVE26 COMPREHENSIVE RLS SECURITY POLICIES
-- ==========================================

-- 1. Enable RLS on all tables
ALTER TABLE public.fests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_sub_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (to prevent conflicts if re-running)
DROP POLICY IF EXISTS "Public read fests" ON public.fests;
DROP POLICY IF EXISTS "Public read sub_events" ON public.sub_events;
DROP POLICY IF EXISTS "Users can read own participant profile" ON public.participants;
DROP POLICY IF EXISTS "Users can update own participant profile" ON public.participants;
DROP POLICY IF EXISTS "Users can insert own participant profile" ON public.participants;
DROP POLICY IF EXISTS "Users can read own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON public.registrations;

-- 3. Define Policies

-- FESTS & SUB_EVENTS
-- Anyone (even non-logged in users viewing the landing page) can view fests and sub_events
CREATE POLICY "Public read fests" ON public.fests FOR SELECT USING (true);
CREATE POLICY "Public read sub_events" ON public.sub_events FOR SELECT USING (true);

-- PARTICIPANTS
-- Users can only read and update their own participant profile
CREATE POLICY "Users can read own participant profile" ON public.participants 
  FOR SELECT USING (auth.uid() = participant_id);
  
CREATE POLICY "Users can update own participant profile" ON public.participants 
  FOR UPDATE USING (auth.uid() = participant_id);

CREATE POLICY "Users can insert own participant profile" ON public.participants 
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- REGISTRATIONS
-- Users can read their own registrations
CREATE POLICY "Users can read own registrations" ON public.registrations 
  FOR SELECT USING (auth.uid() = participant_id);

-- Users can insert their own registrations
CREATE POLICY "Users can insert own registrations" ON public.registrations 
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- REGISTRATION_SUB_EVENTS
-- Users can read their own sub_event registrations (via join on registrations)
CREATE POLICY "Users can read own registration_sub_events" ON public.registration_sub_events 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_sub_events.registration_id 
      AND r.participant_id = auth.uid()
    )
  );

-- TEAMS
CREATE POLICY "Users can read teams they are in" ON public.teams
  FOR SELECT USING (
    leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = teams.team_id AND tm.participant_id = auth.uid()
    )
  );

-- ATTENDANCE
-- Users can read their own attendance records
CREATE POLICY "Users can read own attendance" ON public.attendance
  FOR SELECT USING (participant_id = auth.uid());

-- NOTE: Admins and Coordinators are granted access securely via the Next.js Server 
-- Actions using the SUPABASE_SERVICE_ROLE_KEY. Therefore, we do NOT need to write 
-- complex role-checking SQL policies here. The database natively blocks all malicious 
-- client-side (browser) requests while permitting our secure server-side logic!
