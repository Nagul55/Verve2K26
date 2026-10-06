import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkFests() {
  console.log("=== CHECKING FESTS TABLE ===");
  const { data: fests, error: festError } = await adminClient.from('fests').select('*');
  console.log("Fests Error:", festError);
  console.log("Fests count:", fests?.length);
  console.log("Fests data:", JSON.stringify(fests, null, 2));

  console.log("\n=== CHECKING SUB_EVENTS TABLE ===");
  const { data: subEvents, error: subError } = await adminClient.from('sub_events').select('id, title, fest_id, status');
  console.log("SubEvents Error:", subError);
  console.log("SubEvents count:", subEvents?.length);
  console.log("SubEvents sample:", JSON.stringify(subEvents?.slice(0, 5), null, 2));
}

checkFests();
