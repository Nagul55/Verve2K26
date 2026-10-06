import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: hackathons, error: hErr } = await adminClient.from('hackathons').select('*').limit(1);
  console.log('HACKATHONS TABLE DATA:', hackathons, 'ERROR:', hErr?.message);

  const { data: ps, error: psErr } = await adminClient.from('hackathon_problem_statements').select('*').limit(1);
  console.log('PROBLEM STATEMENTS TABLE DATA:', ps, 'ERROR:', psErr?.message);

  const { data: fests, error: fErr } = await adminClient.from('fests').select('*').limit(1);
  console.log('FESTS SAMPLE:', fests, 'ERROR:', fErr?.message);
}

main().catch(console.error);
