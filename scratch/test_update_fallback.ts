import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testUpdate() {
  const festId = '5a567e01-9c0f-47aa-8960-c09dd88afae5';
  const payload: any = {
    name: 'Verve26',
    description: 'Information Technology Event',
    min_technical: 1,
    min_non_technical: 1,
    registration_closes_at: new Date().toISOString()
  };

  console.log("=== ATTEMPTING UPDATE ===");
  let { error } = await adminClient.from('fests').update(payload).eq('id', festId);
  console.log("Initial Error:", error);

  if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('registration_closes_at'))) {
    console.log("Detected missing column error in PostgREST cache. Falling back to updating core fest properties...");
    delete payload.registration_closes_at;
    const retry = await adminClient.from('fests').update(payload).eq('id', festId);
    console.log("Retry Error:", retry.error);
    error = retry.error;
  }

  console.log("Final success status:", !error);
}

testUpdate();
