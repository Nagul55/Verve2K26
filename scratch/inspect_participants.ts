import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function inspectParticipants() {
  const { data, error } = await adminClient.from('participants').select('*');
  console.log("Participants table error:", error);
  console.log("Participants count:", data?.length);
  console.log("Sample participant:", data?.[0]);
}

inspectParticipants().catch(console.error);
