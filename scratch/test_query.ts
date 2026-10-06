import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testQuery() {
  console.log("=== TESTING SELECT WITH registration_closes_at ===");
  const { data, error } = await adminClient
    .from('fests')
    .select('id, name, description, min_technical, min_non_technical, registration_closes_at, created_at')
    .order('created_at', { ascending: false });

  console.log("Error:", error);
  console.log("Data:", data);
}

testQuery();
