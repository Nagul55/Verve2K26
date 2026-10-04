"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  if (data?.mobile && !/^\d{10}$/.test(String(data.mobile).trim())) {
    return { error: "10 digits required" };
  }

  const adminClient = getAdminClient();
  
  // Get the user's email securely from auth
  const { data: authData, error: authErr } = await adminClient.auth.admin.getUserById(userId);
  if (authErr || !authData?.user) {
    return { error: authErr?.message || "User account not found." };
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

export async function updateAdminProfile(userId: string, data: { full_name: string; email: string }) {
  const supabase = await createClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();

  if (!sessionUser || sessionUser.id !== userId) {
    return { error: "Unauthorized session. Please sign in again." };
  }

  const full_name = (data.full_name || "").trim();
  const email = (data.email || "").trim().toLowerCase();

  if (!full_name || full_name.length < 2) {
    return { error: "Full Name is required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const adminClient = getAdminClient();

  // Get existing user from Auth
  const { data: authData, error: authErr } = await adminClient.auth.admin.getUserById(userId);
  if (authErr || !authData?.user) {
    return { error: authErr?.message || "User account not found." };
  }

  // Check email uniqueness if email changed
  if (email !== authData.user.email?.toLowerCase()) {
    const { data: existingPart } = await adminClient
      .from('participants')
      .select('participant_id')
      .eq('email', email)
      .neq('participant_id', userId)
      .maybeSingle();

    if (existingPart) {
      return { error: "Email address is already in use by another account." };
    }
  }

  // Fetch existing participant row to preserve non-null required schema fields
  const { data: existingParticipant } = await adminClient
    .from('participants')
    .select('*')
    .eq('participant_id', userId)
    .maybeSingle();

  // 1. Update Supabase Auth User email and metadata
  const { error: updateAuthErr } = await adminClient.auth.admin.updateUserById(userId, {
    email: email,
    user_metadata: {
      ...authData.user.user_metadata,
      full_name: full_name,
    },
  });

  if (updateAuthErr) {
    return { error: updateAuthErr.message };
  }

  // 2. Update existing row in participants table (DO NOT create new row or change ID)
  const { error: dbErr } = await adminClient.from('participants').upsert(
    {
      participant_id: userId,
      full_name: full_name,
      email: email,
      mobile: existingParticipant?.mobile || '',
      college: existingParticipant?.college || '',
      department: existingParticipant?.department || '',
      year_of_study: existingParticipant?.year_of_study || '',
      register_number: existingParticipant?.register_number || '',
    },
    { onConflict: 'participant_id' }
  );

  if (dbErr) {
    return { error: dbErr.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');

  return { success: true };
}
