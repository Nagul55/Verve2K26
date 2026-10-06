import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function executeReset() {
  console.log("==========================================");
  console.log("   EVENTRIX PRODUCTION DATA RESET SCRIPT  ");
  console.log("==========================================");

  // 1. Identify preserved accounts
  const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr || !users) {
    throw new Error(`Failed to list auth users: ${listErr?.message}`);
  }

  const preserveIds = new Set<string>();
  const adminIds: string[] = [];
  const coordinatorIds: string[] = [];
  const studentUsers: any[] = [];

  users.forEach(u => {
    const role = u.app_metadata?.role || u.user_metadata?.role || 'student';
    if (role === 'admin') {
      preserveIds.add(u.id);
      adminIds.push(u.id);
    } else if (role === 'coordinator') {
      preserveIds.add(u.id);
      coordinatorIds.push(u.id);
    } else {
      studentUsers.push(u);
    }
  });

  console.log(`\n[SAFETY CHECK] Preserving ${adminIds.length} Admin(s) and ${coordinatorIds.length} Coordinator(s).`);
  console.log(`Preserved IDs (${preserveIds.size}):`, Array.from(preserveIds));

  if (adminIds.length === 0) {
    throw new Error("SAFETY ABORT: No Admin account detected in preserve list!");
  }
  if (coordinatorIds.length === 0) {
    throw new Error("SAFETY ABORT: No Coordinator accounts detected in preserve list!");
  }

  console.log(`Student accounts to delete from Auth: ${studentUsers.length}`);

  // 2. Perform table deletions in dependency order
  console.log("\n--- STEP 1: DELETING TEAM MEMBERS ---");
  const { error: err1 } = await adminClient.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error("Err team_members:", err1.message);

  console.log("--- STEP 2: DELETING TEAMS ---");
  const { error: err2 } = await adminClient.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error("Err teams:", err2.message);

  console.log("--- STEP 3: DELETING REGISTRATION SUB EVENTS ---");
  const { error: err3 } = await adminClient.from('registration_sub_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err3) console.error("Err registration_sub_events:", err3.message);

  console.log("--- STEP 4: DELETING ATTENDANCE RECORDS ---");
  const { error: err4 } = await adminClient.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err4) console.error("Err attendance:", err4.message);

  console.log("--- STEP 5: DELETING REGISTRATIONS ---");
  const { error: err5 } = await adminClient.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err5) console.error("Err registrations:", err5.message);

  console.log("--- STEP 6: DELETING SUB EVENTS ---");
  const { error: err6 } = await adminClient.from('sub_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err6) console.error("Err sub_events:", err6.message);

  console.log("--- STEP 7: DELETING HACKATHON PROBLEM STATEMENTS ---");
  const { error: err7 } = await adminClient.from('hackathon_problem_statements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err7) console.error("Err hackathon_problem_statements:", err7.message);

  console.log("--- STEP 8: DELETING HACKATHONS ---");
  const { error: err8 } = await adminClient.from('hackathons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err8) console.error("Err hackathons:", err8.message);

  console.log("--- STEP 9: DELETING FESTS ---");
  const { error: err9 } = await adminClient.from('fests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err9) console.error("Err fests:", err9.message);

  console.log("--- STEP 10: DELETING NON-PRESERVED PARTICIPANT PROFILES ---");
  const preserveArray = Array.from(preserveIds);
  const { error: err10 } = await adminClient
    .from('participants')
    .delete()
    .not('participant_id', 'in', `(${preserveArray.join(',')})`);
  if (err10) console.error("Err participants:", err10.message);

  console.log("--- STEP 11: DELETING STUDENT AUTH ACCOUNTS ---");
  for (const st of studentUsers) {
    if (!preserveIds.has(st.id)) {
      const { error: delErr } = await adminClient.auth.admin.deleteUser(st.id);
      if (delErr) {
        console.error(`Failed to delete student auth user ${st.email} (${st.id}):`, delErr.message);
      } else {
        console.log(`Deleted student auth user: ${st.email} (${st.id})`);
      }
    }
  }

  console.log("--- STEP 12: RESETTING COORDINATOR ASSIGNMENTS IN AUTH METADATA ---");
  for (const cId of coordinatorIds) {
    const { error: metaErr } = await adminClient.auth.admin.updateUserById(cId, {
      app_metadata: {
        coordinating_event_ids: []
      }
    });
    if (metaErr) {
      console.error(`Error resetting app_metadata for coordinator ${cId}:`, metaErr.message);
    } else {
      console.log(`Reset coordinator event assignments for ID: ${cId}`);
    }
  }

  console.log("--- STEP 13: CLEANING UP STORAGE BUCKETS ---");
  const buckets = ['event-resources', 'hackathon-problem-statements'];
  for (const bName of buckets) {
    const { data: files } = await adminClient.storage.from(bName).list();
    if (files && files.length > 0) {
      const paths = files.map(f => f.name);
      const { error: removeErr } = await adminClient.storage.from(bName).remove(paths);
      if (removeErr) {
        console.error(`Error removing files from bucket '${bName}':`, removeErr.message);
      } else {
        console.log(`Cleaned ${paths.length} file(s) from bucket '${bName}'`);
      }
    }
  }

  console.log("\n==========================================");
  console.log("      DELETION COMPLETE — VERIFYING       ");
  console.log("==========================================");

  // Verification queries
  const verifTables = [
    'fests',
    'hackathons',
    'hackathon_problem_statements',
    'sub_events',
    'registrations',
    'registration_sub_events',
    'teams',
    'team_members',
    'attendance',
    'participants'
  ];

  for (const table of verifTables) {
    const { count } = await adminClient.from(table).select('*', { count: 'exact', head: true });
    console.log(`Verification - '${table}': ${count} rows`);
  }

  const { data: { users: finalUsers } } = await adminClient.auth.admin.listUsers();
  console.log(`Verification - Final Auth Users Count: ${finalUsers?.length}`);
  finalUsers?.forEach(u => {
    const r = u.app_metadata?.role || u.user_metadata?.role;
    console.log(`  - ${u.email} [Role: ${r}] [ID: ${u.id}]`);
  });
}

executeReset().catch(console.error);
