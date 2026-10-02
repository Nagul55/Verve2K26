
import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Hardcode the user.id for mohamedimran.24it@sonatech.ac.in
  // From the screenshot: 20-a382-9bb546e0... wait, I can just query it.
  const { data: users } = await supabase.auth.admin.listUsers();
  const imran = users.users.find(u => u.email === 'mohamedimran.24it@sonatech.ac.in');
  
  if (!imran) {
    console.log("User not found!");
    return;
  }

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      registration_sub_events (
        sub_events (
          id,
          title,
          category,
          date,
          location,
          time
        )
      )
    `)
    .eq('participant_id', imran.id);

  console.log("ERROR:", error);
  console.log("DATA:", JSON.stringify(data, null, 2));
}

test();
