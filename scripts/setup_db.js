const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
if (!process.env.DATABASE_URL) { console.error('No DATABASE_URL'); process.exit(1); }
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query(`
    ALTER TABLE fests ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'fest';
    ALTER TABLE fests ADD COLUMN IF NOT EXISTS logo_url TEXT;

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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hackathon_problem_statements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}).then(() => {
  console.log('Tables created successfully');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
