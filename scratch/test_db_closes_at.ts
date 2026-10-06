import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log("Checking fests table...");
  const { data: fests, error: selectErr } = await supabase.from('fests').select('*').limit(1);
  if (selectErr) {
    console.error("Select error:", selectErr);
  } else {
    console.log("Select success! Fest sample:", fests);
  }

  if (fests && fests.length > 0) {
    const festId = fests[0].id;
    console.log("Attempting update with registration_closes_at on fest ID:", festId);
    const testDate = new Date().toISOString();
    const { data: updateData, error: updateErr } = await supabase
      .from('fests')
      .update({ registration_closes_at: testDate })
      .eq('id', festId)
      .select();

    if (updateErr) {
      console.error("Update error:", updateErr);
    } else {
      console.log("Update SUCCESS! Updated fest:", updateData);
    }
  }
}

main();
