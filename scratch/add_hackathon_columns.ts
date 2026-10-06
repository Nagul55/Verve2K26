import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const ref = match ? match[1] : '';

async function main() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD;
  const connectionString = process.env.DATABASE_URL || (dbPassword ? `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres` : null);

  if (!connectionString) {
    console.log('No direct postgres connection string available in env. SQL migration script created in supabase/migrations/20261006_hackathon_fields.sql');
    return;
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const sql = `
      ALTER TABLE public.hackathons
        ADD COLUMN IF NOT EXISTS theme TEXT,
        ADD COLUMN IF NOT EXISTS domain TEXT,
        ADD COLUMN IF NOT EXISTS organizing_department TEXT,
        ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'Offline',
        ADD COLUMN IF NOT EXISTS external_link TEXT,
        ADD COLUMN IF NOT EXISTS abstract_submission_deadline TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS project_submission_deadline TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS demo_pitch_date TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS maximum_participants INT,
        ADD COLUMN IF NOT EXISTS eligibility_type VARCHAR(100) DEFAULT 'College Students',
        ADD COLUMN IF NOT EXISTS allowed_departments TEXT,
        ADD COLUMN IF NOT EXISTS allowed_years TEXT,
        ADD COLUMN IF NOT EXISTS allowed_colleges TEXT,
        ADD COLUMN IF NOT EXISTS rules TEXT,
        ADD COLUMN IF NOT EXISTS participation_guidelines TEXT,
        ADD COLUMN IF NOT EXISTS submission_guidelines TEXT,
        ADD COLUMN IF NOT EXISTS judging_criteria TEXT,
        ADD COLUMN IF NOT EXISTS code_of_conduct TEXT,
        ADD COLUMN IF NOT EXISTS problem_statement_description TEXT,
        ADD COLUMN IF NOT EXISTS required_tech_stack TEXT,
        ADD COLUMN IF NOT EXISTS github_url_required BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS demo_video_required BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS ppt_required BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS report_required BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS live_demo_required BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS prize_1st TEXT,
        ADD COLUMN IF NOT EXISTS prize_2nd TEXT,
        ADD COLUMN IF NOT EXISTS prize_3rd TEXT,
        ADD COLUMN IF NOT EXISTS special_prizes TEXT;
    `;

    await client.query(sql);
    console.log('Successfully updated hackathons table schema!');
  } catch (err: any) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
