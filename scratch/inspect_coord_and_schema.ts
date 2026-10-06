import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('--- 1. LISTING COORINATOR AUTH USERS ---');
  const { data: authData } = await adminClient.auth.admin.listUsers();
  const coordUsers = (authData?.users || []).filter(u => u.app_metadata?.role === 'coordinator');
  console.log(`Found ${coordUsers.length} coordinator users:`);
  coordUsers.forEach(u => {
    console.log({
      id: u.id,
      email: u.email,
      phone: u.phone,
      user_metadata: u.user_metadata,
      app_metadata: u.app_metadata
    });
  });

  console.log('\n--- 2. PARTICIPANTS TABLE FOR COORDINATOR EMAILS/IDS ---');
  const coordEmails = coordUsers.map(u => u.email).filter(Boolean);
  const coordIds = coordUsers.map(u => u.id);
  
  const { data: partByEmail } = await adminClient
    .from('participants')
    .select('*')
    .in('email', coordEmails);
  console.log('Participants by email:', partByEmail);

  const { data: partById } = await adminClient
    .from('participants')
    .select('*')
    .in('participant_id', coordIds);
  console.log('Participants by ID:', partById);

  console.log('\n--- 3. CHECK PROFILES TABLE IF EXISTS ---');
  const { data: profiles, error: pErr } = await adminClient.from('profiles').select('*').limit(5);
  console.log('Profiles table:', profiles, 'Error:', pErr?.message);

  console.log('\n--- 4. SUB_EVENTS & COORDINATOR MAPPING ---');
  const { data: subEvents } = await adminClient.from('sub_events').select('id, title, capacity, status').limit(5);
  console.log('Sample sub events:', subEvents);
}

main().catch(console.error);
