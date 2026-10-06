import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function checkAllTables() {
  const { data, error } = await adminClient.rpc('get_tables_list'); // if available or query direct
  if (error) {
    // query postgres tables via raw or known list
    console.log("Checking known tables...");
  }
  
  // Let's test direct select on all possible tables
  const candidateTables = [
    'fests',
    'hackathons',
    'hackathon_problem_statements',
    'sub_events',
    'registrations',
    'registration_sub_events',
    'teams',
    'team_members',
    'attendance',
    'coordinators',
    'participants',
    'invitations',
    'certificates',
    'tickets',
    'notifications',
    'approvals'
  ];

  for (const t of candidateTables) {
    const { count, error: err } = await adminClient.from(t).select('*', { count: 'exact', head: true });
    if (!err) {
      console.log(`[EXISTS] Table '${t}': ${count} rows`);
    }
  }
}

checkAllTables().catch(console.error);
