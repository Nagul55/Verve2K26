require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: rse } = await supabaseAdmin.from('registration_sub_events').select('*').limit(1);
  console.log("RSE columns:", Object.keys(rse[0] || {}));
}
run();
