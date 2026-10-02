"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function updateProfile(userId: string, data: any) {
  const adminClient = getAdminClient();
  
  // Get the user's email securely from auth
  const { data: authData } = await adminClient.auth.admin.getUserById(userId);
  if (!authData.user) {
    return { error: "User not found" };
  }
  
  // We use upsert in case the participant stub wasn't properly created during signup
  const { error } = await adminClient.from('participants').upsert({
    participant_id: userId,
    email: authData.user.email,
    ...data
  }, {
    onConflict: 'participant_id'
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
