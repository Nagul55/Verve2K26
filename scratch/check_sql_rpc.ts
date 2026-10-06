import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const testNames = ['exec_sql', 'exec', 'run_sql', 'sql', 'query'];
  for (const name of testNames) {
    const { data, error } = await adminClient.rpc(name, { query: 'SELECT 1;' });
    console.log(`RPC '${name}':`, data, error?.message);
  }
}

main().catch(console.error);
