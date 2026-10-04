"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function updateProfile(userId: string, data: any) {
  if (!userId || typeof userId !== 'string' || userId.trim().length < 10) {
    return { error: "Invalid user session. Please sign in." };
  }

  if (data?.mobile && String(data.mobile).trim().length > 0 && !/^\d{10}$/.test(String(data.mobile).trim())) {
    return { error: "10 digits required" };
  }

  const adminClient = getAdminClient();
  
  // Get the user's email securely from auth
  const { data: authData, error: authErr } = await adminClient.auth.admin.getUserById(userId);
  if (authErr || !authData?.user) {
    return { error: authErr?.message || "User account not found." };
  }

  // Update Auth user_metadata (full_name) and email if changed
  const authUpdates: any = {};
  if (data.full_name) {
    authUpdates.user_metadata = { ...authData.user.user_metadata, full_name: data.full_name };
  }
  if (data.email && data.email !== authData.user.email) {
    authUpdates.email = data.email;
  }
  
  if (Object.keys(authUpdates).length > 0) {
    const { error: updateAuthErr } = await adminClient.auth.admin.updateUserById(userId, authUpdates);
    if (updateAuthErr) {
      console.error("Error updating auth user:", updateAuthErr);
    }
  }

  // We use upsert in case the participant stub wasn't properly created during signup
  const { error } = await adminClient.from('participants').upsert({
    participant_id: userId,
    email: data.email || authData.user.email,
    ...data
  }, {
    onConflict: 'participant_id'
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
