import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function mapParticipants() {
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const { data: participants } = await adminClient.from('participants').select('*');

  const preserveIds = new Set<string>();
  users?.forEach(u => {
    const role = u.app_metadata?.role || u.user_metadata?.role || 'student';
    if (role === 'admin' || role === 'coordinator') {
      preserveIds.add(u.id);
    }
  });

  console.log("Preserved Auth IDs count:", preserveIds.size);
  console.log("Total Participants rows:", participants?.length);

  const toKeep: any[] = [];
  const toDelete: any[] = [];

  participants?.forEach(p => {
    if (preserveIds.has(p.participant_id)) {
      toKeep.push(p);
    } else {
      toDelete.push(p);
    }
  });

  console.log("\n=== PARTICIPANTS TO KEEP ===");
  toKeep.forEach(p => console.log(`- ${p.full_name} (${p.email}) [ID: ${p.participant_id}]`));

  console.log("\n=== PARTICIPANTS TO DELETE ===");
  toDelete.forEach(p => console.log(`- ${p.full_name} (${p.email}) [ID: ${p.participant_id}]`));
}

mapParticipants().catch(console.error);
