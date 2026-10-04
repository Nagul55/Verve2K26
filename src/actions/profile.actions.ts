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

export async function getProfileForUser(userId: string, email?: string) {
  if (!userId) return null;
  const adminClient = getAdminClient();

  let { data: profile } = await adminClient
    .from('participants')
    .select('*')
    .eq('participant_id', userId)
    .maybeSingle();

  if (!profile && email) {
    const { data: profileByEmail } = await adminClient
      .from('participants')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileByEmail) {
      profile = profileByEmail;
      await adminClient
        .from('participants')
        .update({ participant_id: userId })
        .eq('email', email);
    }
  }

  // Fetch Auth user metadata to guarantee fallback profile information
  const { data: authData } = await adminClient.auth.admin.getUserById(userId);
  const userMetaData = authData?.user?.user_metadata || {};

  if (!profile) {
    profile = {
      participant_id: userId,
      full_name: userMetaData.full_name || email?.split('@')[0] || 'User',
      email: email || '',
      mobile: '',
      college: '',
      department: '',
      year_of_study: '',
      register_number: '',
      gender: userMetaData.gender || ''
    };
  } else {
    if (!profile.gender && userMetaData.gender) {
      profile.gender = userMetaData.gender;
    }
    if (!profile.full_name && userMetaData.full_name) {
      profile.full_name = userMetaData.full_name;
    }
  }

  return profile;
}

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
  
  const payload = {
    participant_id: userId,
    email: authData.user.email,
    ...data
  };

  let { error } = await adminClient.from('participants').upsert(payload, {
    onConflict: 'participant_id'
  });

  if (error && (error.code === 'PGRST204' || (error.message && error.message.toLowerCase().includes('gender')))) {
    const { gender, ...payloadWithoutGender } = payload;
    const { error: fallbackErr } = await adminClient.from('participants').upsert(payloadWithoutGender, {
      onConflict: 'participant_id'
    });
    error = fallbackErr;
  }

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
