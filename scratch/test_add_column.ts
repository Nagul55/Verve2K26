import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAddColumn() {
  console.log("=== CHECKING IF COLUMNS CAN BE READ/WRITTEN ===");
  const { data, error } = await adminClient
    .from('fests')
    .update({ registration_closes_at: new Date().toISOString() })
    .eq('id', '5a567e01-9c0f-47aa-8960-c09dd88afae5')
    .select();

  console.log("Update result error:", error);
  console.log("Update result data:", data);
}

testAddColumn();
