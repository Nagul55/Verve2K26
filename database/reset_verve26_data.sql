-- ==========================================
-- RESET REGISTRATIONS & TEAMS FOR VERVE26
-- ==========================================
-- This script will delete ALL registrations, tickets, and teams 
-- specifically for the Verve26 Fest, allowing you to test fresh.
-- Your events and participants (users) will NOT be deleted.

-- The ID for Verve26 in our schema is: '00000000-0000-0000-0000-000000000001'

-- 1. Delete all teams (and cascading team_members) that belong to Verve26 sub-events
DELETE FROM public.teams 
WHERE event_id IN (
    SELECT id FROM public.sub_events 
    WHERE fest_id = '00000000-0000-0000-0000-000000000001'
);

-- 2. Delete all registrations (and cascading registration_sub_events) for Verve26
DELETE FROM public.registrations 
WHERE fest_id = '00000000-0000-0000-0000-000000000001';
