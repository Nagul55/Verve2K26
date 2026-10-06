import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function inspectColumns() {
  const { data: fest } = await adminClient.from('fests').select('*').limit(1);
  console.log("Fests columns:", fest ? Object.keys(fest[0] || {}) : []);

  const { data: subEvent } = await adminClient.from('sub_events').select('*').limit(1);
  console.log("SubEvents columns:", subEvent ? Object.keys(subEvent[0] || {}) : []);
}

inspectColumns();
