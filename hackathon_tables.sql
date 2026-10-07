-- Add event_type to fests
ALTER TABLE fests ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'fest';
ALTER TABLE fests ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES fests(id) ON DELETE CASCADE,
    tagline VARCHAR(255),
    description TEXT,
    registration_opens_at TIMESTAMPTZ,
    registration_closes_at TIMESTAMPTZ,
    hackathon_starts_at TIMESTAMPTZ NOT NULL,
    hackathon_ends_at TIMESTAMPTZ NOT NULL,
    maximum_teams INT NOT NULL,
    minimum_team_size INT NOT NULL,
    maximum_team_size INT NOT NULL,
    venue VARCHAR(255),
    coordinator_id UUID REFERENCES auth.users(id),
    
    -- New fields discovered from the Vercel app
    abstract_submission_deadline TIMESTAMPTZ,
    allowed_colleges TEXT,
    allowed_departments TEXT,
    allowed_years TEXT,
    code_of_conduct TEXT,
    demo_pitch_date TIMESTAMPTZ,
    demo_video_required BOOLEAN,
    domain TEXT,
    eligibility_type TEXT,
    external_link TEXT,
    github_url_required BOOLEAN,
    judging_criteria TEXT,
    live_demo_required BOOLEAN,
    maximum_participants INT,
    mode TEXT,
    organizing_department TEXT,
    participation_guidelines TEXT,
    ppt_required BOOLEAN,
    prize_1st TEXT,
    prize_2nd TEXT,
    prize_3rd TEXT,
    prize_special TEXT,
    problem_statement_description TEXT,
    problem_statement_title TEXT,
    project_submission_deadline TIMESTAMPTZ,
    idea_submission_deadline TIMESTAMPTZ,
    winner_announcement_date TIMESTAMPTZ,
    report_required BOOLEAN,
    source_code_required BOOLEAN,
    prototype_link_required BOOLEAN,
    required_tech_stack TEXT,
    rules TEXT,
    theme TEXT,
    sponsors TEXT,
    submission_guidelines TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hackathon_problem_statements table
CREATE TABLE IF NOT EXISTS hackathon_problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hackathon_teams table
CREATE TABLE IF NOT EXISTS hackathon_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    passcode VARCHAR(50) NOT NULL,
    problem_statement_id UUID REFERENCES hackathon_problem_statements(id) ON DELETE SET NULL,
    leader_id UUID REFERENCES participants(participant_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (hackathon_id, name)
);

-- Create hackathon_team_members table
CREATE TABLE IF NOT EXISTS hackathon_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(participant_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (team_id, participant_id)
);

-- Allow public read access to fests and hackathons
-- Enable RLS and setup policies as per your project's security rules
-- For now we assume policies will be handled or service role is used for backend actions
