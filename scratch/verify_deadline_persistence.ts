import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function testPersistence() {
  console.log("=== VERIFYING FEST REGISTRATION DEADLINE PERSISTENCE ===");
  const { data: fests, error: selectErr } = await supabase.from('fests').select('*').limit(1);
  
  if (selectErr) {
    console.error("Select Error:", selectErr);
    return;
  }

  if (!fests || fests.length === 0) {
    console.error("No fests found in database.");
    return;
  }

  const fest = fests[0];
  console.log("Found fest:", fest.name, "(ID:", fest.id, ")");
  
  const testIsoDate = new Date("2026-10-14T06:30:00.000Z").toISOString(); // 14-10-2026 12:00 AM IST
  console.log("Attempting to update registration_closes_at to:", testIsoDate);

  const { data: updated, error: updateErr } = await supabase
    .from('fests')
    .update({ registration_closes_at: testIsoDate })
    .eq('id', fest.id)
    .select();

  if (updateErr) {
    console.error("❌ PERSISTENCE TEST FAILED:", updateErr.message);
    console.error("Status: Migration pending. Please run supabase/fix_fest_registration_deadline.sql in Supabase SQL Editor.");
  } else {
    console.log("✅ PERSISTENCE TEST SUCCESSFUL!");
    console.log("Updated record in Supabase:", updated);
  }
}

testPersistence();
