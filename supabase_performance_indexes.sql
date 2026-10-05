-- PERFORMANCE OPTIMIZATION INDEXES
-- Run this in your Supabase SQL Editor to improve event-day concurrency performance.

-- 1. Registration Sub-Events
-- Heavily queried by the QR Scanner, Coordinator Dashboard, and Admin Dashboard.
CREATE INDEX IF NOT EXISTS idx_reg_sub_events_sub_event_id ON registration_sub_events(sub_event_id);
CREATE INDEX IF NOT EXISTS idx_reg_sub_events_registration_id ON registration_sub_events(registration_id);

-- 2. Attendance
-- Heavily queried during check-in to prevent duplicate scans.
-- The composite index ensures the QR scanner finds the specific record instantly.
CREATE INDEX IF NOT EXISTS idx_attendance_participant_event ON attendance(participant_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);

-- 3. Registrations
-- Queried on Student Dashboard load and when checking registrations.
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_fest_id ON registrations(fest_id);

-- 4. Participants
-- Used frequently for team member lookups via email during registration.
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
