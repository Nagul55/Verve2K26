import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function checkRpc() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.fests ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;' });
  console.log("RPC exec_sql result:", { data, error });
}

checkRpc();
