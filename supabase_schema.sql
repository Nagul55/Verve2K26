-- Verve26 Platform - Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE event_category AS ENUM ('Technical', 'Non-Technical');
CREATE TYPE participation_type AS ENUM ('Individual', 'Team');
CREATE TYPE event_status AS ENUM ('Draft', 'Open', 'Full', 'Closed', 'Cancelled', 'Archived');
CREATE TYPE registration_status AS ENUM ('Pending', 'Confirmed', 'Cancelled');
CREATE TYPE team_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE ticket_status AS ENUM ('Active', 'Revoked', 'Used');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent');

-- 1. Participants Table
-- Students do not have auth accounts, so this is just data.
CREATE TABLE participants (
    participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    register_number TEXT,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT NOT NULL,
    college TEXT,
    department TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    section TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
-- Contains all 8 events and their configurations.
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category event_category NOT NULL,
    participation_type participation_type NOT NULL,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    capacity INT NOT NULL,
    status event_status DEFAULT 'Draft',
    -- JSONB for flexible rules (min/max team size, specific eligible colleges, etc)
    team_settings JSONB,
    eligibility_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event Registrations Table
-- Each participant will have exactly 3 records here (2 Tech, 1 Non-Tech)
CREATE TABLE event_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(participant_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    status registration_status DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmation_timestamp TIMESTAMPTZ,
    UNIQUE(participant_id, event_id) -- Prevent duplicate booking
);

-- 4. Teams Table
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    leader_participant_id UUID REFERENCES participants(participant_id),
    status team_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, team_name) -- Unique team name per event
);

-- 5. Team Members Table
CREATE TABLE team_members (
    team_member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(team_id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(participant_id) ON DELETE CASCADE,
    membership_status TEXT DEFAULT 'Active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, participant_id)
);

-- 6. QR Tickets Table
CREATE TABLE qr_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES event_registrations(registration_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    status ticket_status DEFAULT 'Active',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- 7. Attendance Table
CREATE TABLE attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(participant_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE CASCADE,
    registration_id UUID REFERENCES event_registrations(registration_id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'Present',
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    -- The Supabase Auth User ID of the admin/coordinator who scanned
    scanner_admin_id UUID REFERENCES auth.users(id), 
    source TEXT DEFAULT 'QR_Scanner', -- QR_Scanner or Manual
    correction_reason TEXT,
    UNIQUE(participant_id, event_id) -- Prevent duplicate scanning
);

-- 8. Email Logs Table
CREATE TABLE email_logs (
    email_log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(participant_id),
    event_id UUID REFERENCES events(event_id),
    template TEXT NOT NULL,
    provider_message_id TEXT,
    delivery_status TEXT DEFAULT 'Queued',
    attempt_count INT DEFAULT 1,
    failure_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Admin Roles (Mapping Supabase Auth users to roles)
CREATE TABLE admin_roles (
    admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('Super Admin', 'Event Coordinator')),
    assigned_events UUID[] -- Array of event_ids they can manage if they are a coordinator
);

-- Function: Ensure Participant capacity isn't exceeded during booking
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    max_capacity INT;
BEGIN
    SELECT COUNT(*) INTO current_count FROM event_registrations WHERE event_id = NEW.event_id AND status = 'Confirmed';
    SELECT capacity INTO max_capacity FROM events WHERE event_id = NEW.event_id;
    
    IF current_count >= max_capacity THEN
        RAISE EXCEPTION 'Event capacity reached.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_capacity
BEFORE INSERT ON event_registrations
FOR EACH ROW EXECUTE FUNCTION check_event_capacity();
