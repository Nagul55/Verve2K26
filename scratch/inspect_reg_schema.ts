import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('--- REGISTRATION_SUB_EVENTS ---');
  const { data: rse } = await adminClient.from('registration_sub_events').select('*').limit(3);
  console.log(rse);

  console.log('--- EVENT_REGISTRATIONS ---');
  const { data: er } = await adminClient.from('event_registrations').select('*').limit(3);
  console.log(er);

  console.log('--- TEAMS ---');
  const { data: teams, error: tErr } = await adminClient.from('teams').select('*').limit(3);
  console.log(teams, tErr?.message);

  console.log('--- TEAM_MEMBERS ---');
  const { data: tm, error: tmErr } = await adminClient.from('team_members').select('*').limit(3);
  console.log(tm, tmErr?.message);
}

main().catch(console.error);
