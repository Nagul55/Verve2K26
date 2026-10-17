import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Make sure .env.local is loaded properly.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = "nagulaadhi08@gmail.com";
  console.log(`Searching for ghost records for ${email}...`);

  // 1. Find participant ID from the participants table
  const { data: participants, error: pError } = await adminClient
    .from('participants')
    .select('participant_id')
    .eq('email', email);

  if (pError) {
    console.error("Error fetching participant:", pError);
    return;
  }

  if (!participants || participants.length === 0) {
    console.log(`No participant found with email ${email}. They might already be fully deleted.`);
    return;
  }

  for (const part of participants) {
    const userId = part.participant_id;
    console.log(`Found participant_id: ${userId}`);

    // Delete team_members
    console.log("Deleting from team_members...");
    await adminClient.from('team_members').delete().eq('participant_id', userId);

    // Delete teams led by the user
    console.log("Deleting teams led by user...");
    await adminClient.from('teams').delete().eq('leader_participant_id', userId);

    // Delete attendance
    console.log("Deleting attendance...");
    await adminClient.from('attendance').delete().eq('participant_id', userId);

    // Delete registrations
    console.log("Deleting registrations...");
    await adminClient.from('event_registrations').delete().eq('participant_id', userId);
    await adminClient.from('registrations').delete().eq('participant_id', userId);

    // Finally, delete participants row
    console.log("Deleting participants row...");
    const { error: delErr } = await adminClient.from('participants').delete().eq('participant_id', userId);
    if (delErr) {
      console.error("Error deleting participant row:", delErr);
    } else {
      console.log(`Successfully cleaned up ghost records for ${userId}.`);
    }
  }
}

run().catch(console.error);
