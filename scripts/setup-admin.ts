import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Key in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey);

async function setupAccounts() {
  console.log("Setting up Admin and Coordinator accounts...");

  // 1. Create Admin Account
  const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
    email: 'admin@verve26.com',
    password: 'password123',
    email_confirm: true,
    app_metadata: { role: 'admin' },
    user_metadata: { full_name: 'Super Admin' }
  });

  if (adminError) {
    console.error("Failed to create admin:", adminError.message);
  } else {
    console.log("✅ Admin created! Email: admin@verve26.com | Password: password123");
  }

  // 2. Create Coordinator Account
  const { data: coordData, error: coordError } = await adminClient.auth.admin.createUser({
    email: 'coordinator@verve26.com',
    password: 'password123',
    email_confirm: true,
    app_metadata: { role: 'coordinator' },
    user_metadata: { full_name: 'Event Coordinator' }
  });

  if (coordError) {
    console.error("Failed to create coordinator:", coordError.message);
  } else {
    console.log("✅ Coordinator created! Email: coordinator@verve26.com | Password: password123");
  }
}

setupAccounts();
