import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testFests() {
  console.log("=== TESTING SELECT * FROM FESTS ===");
  const { data, error } = await adminClient
    .from('fests')
    .select('*')
    .order('created_at', { ascending: false });

  console.log("Select * Error:", error);
  console.log("Select * Data:", data);
}

testFests();
