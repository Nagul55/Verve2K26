import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function audit() {
  console.log("=== 1. AUDITING AUTH USERS & ROLES ===");
  const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) {
    console.error("Auth users list error:", authError);
    return;
  }

  const admins: any[] = [];
  const coordinators: any[] = [];
  const students: any[] = [];

  users.forEach(u => {
    const role = u.app_metadata?.role || u.user_metadata?.role || 'student';
    const userInfo = {
      id: u.id,
      email: u.email,
      role,
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email,
      phone: u.user_metadata?.mobile_number || u.user_metadata?.phone || 'N/A'
    };
    if (role === 'admin') admins.push(userInfo);
    else if (role === 'coordinator') coordinators.push(userInfo);
    else students.push(userInfo);
  });

  console.log(`Admins (${admins.length}):`, JSON.stringify(admins, null, 2));
  console.log(`Coordinators (${coordinators.length}):`, JSON.stringify(coordinators, null, 2));
  console.log(`Students (${students.length}):`, JSON.stringify(students, null, 2));

  console.log("\n=== 2. AUDITING DATABASE TABLES & ROW COUNTS ===");

  const tables = [
    'fests',
    'hackathons',
    'hackathon_problem_statements',
    'sub_events',
    'registrations',
    'registration_sub_events',
    'teams',
    'team_members',
    'tickets',
    'attendance',
    'certificates',
    'invitations',
    'profiles',
    'notifications'
  ];

  for (const table of tables) {
    const { count, error } = await adminClient
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`Table '${table}': ERROR / Table may not exist (${error.message})`);
    } else {
      console.log(`Table '${table}': ${count} rows`);
    }
  }

  console.log("\n=== 3. AUDITING STORAGE BUCKETS ===");
  const { data: buckets, error: bError } = await adminClient.storage.listBuckets();
  if (bError) {
    console.log("Bucket list error:", bError.message);
  } else {
    for (const b of buckets || []) {
      const { data: files } = await adminClient.storage.from(b.name).list();
      console.log(`Bucket '${b.name}': ${files?.length || 0} objects in root`);
    }
  }
}

audit().catch(console.error);
