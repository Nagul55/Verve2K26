require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixIds() {
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const { data: participants } = await supabase.from('participants').select('participant_id, email');
  
  let fixedCount = 0;
  for (const user of authUsers.users) {
    const p = participants.find(p => p.email === user.email);
    if (p && p.participant_id !== user.id) {
      console.log(`Fixing ${user.email}: ${p.participant_id} -> ${user.id}`);
      await supabase.from('participants').update({ participant_id: user.id }).eq('email', user.email);
      fixedCount++;
    }
  }
  console.log('Fixed', fixedCount, 'out of sync users.');
}
fixIds();
