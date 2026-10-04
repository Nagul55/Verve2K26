"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client to bypass email confirmations and set roles
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Login failed. Check credentials." };
  }

  // Check role from app_metadata instead of a custom SQL table!
  const role = data.user.app_metadata?.role || 'student';

  if (role === 'admin') {
    return { success: true, redirectTo: '/admin' };
  } else if (role === 'coordinator') {
    return { success: true, redirectTo: '/coordinator' };
  } else {
    return { success: true, redirectTo: '/dashboard' };
  }
}

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';
  const fullName = (formData.get('fullName') as string) || '';
  const mobile = (formData.get('mobile') as string) || '';
  const college = (formData.get('college') as string) || '';
  const department = (formData.get('department') as string) || '';
  const yearOfStudy = (formData.get('yearOfStudy') as string) || '';
  const registerNumber = (formData.get('registerNumber') as string) || '';

  if (
    !email.trim() ||
    !password.trim() ||
    !fullName.trim() ||
    !mobile.trim() ||
    !college.trim() ||
    !department.trim() ||
    !yearOfStudy.trim() ||
    !registerNumber.trim()
  ) {
    return { error: 'Please fill in all 8 required fields to create your account.' };
  }
  
  const adminClient = getAdminClient();

  // 1. Bypass email confirmation by using the Service Role admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Forces the account to be instantly active!
    app_metadata: { role: 'student' },
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    return { error: authError.message };
  }

  // Instead of auto-login, we redirect them to the login page as requested.

  // 3. Create the participant stub
  if (authData.user) {
    const { error: insertError } = await adminClient
      .from('participants')
      .insert({
        participant_id: authData.user.id,
        full_name: fullName,
        email: email,
        mobile: mobile,
        department: department,
        year_of_study: yearOfStudy,
        college: college,
        register_number: registerNumber
      });
      
    if (insertError) {
      console.error("Error creating participant stub:", insertError);
    }
  }

  return { success: true, redirectTo: '/?registered=true' };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function getCoordinators() {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers();
  
  if (error) return [];
  
  // Filter users who have role = coordinator
  return data.users.filter(u => u.app_metadata?.role === 'coordinator').map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.user_metadata?.full_name || 'Coordinator',
    subEventId: u.app_metadata?.coordinating_event_id || null
  }));
}

export async function createCoordinator(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const subEventId = formData.get('subEventId') as string;
  
  const adminClient = getAdminClient();
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'coordinator', coordinating_event_id: subEventId },
    user_metadata: { full_name: fullName }
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true };
}

export async function updateCoordinatorAssignment(coordinatorId: string, subEventId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(coordinatorId, {
    app_metadata: { role: 'coordinator', coordinating_event_id: subEventId }
  });
  return { success: !error, error: error?.message };
}

export async function deleteCoordinator(coordinatorId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(coordinatorId);
  return { success: !error, error: error?.message };
}

export async function deleteUserAccount(userId: string) {
  try {
    const adminClient = getAdminClient();

    // 1. Delete associated registrations & attendance records
    await adminClient.from('attendance').delete().eq('participant_id', userId);
    await adminClient.from('event_registrations').delete().eq('participant_id', userId);
    await adminClient.from('registrations').delete().eq('participant_id', userId);

    // 2. Delete from participants profile table
    await adminClient.from('participants').delete().eq('participant_id', userId);

    // 3. Delete from Supabase Auth (auth.users)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Auth deleteUser error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting user account:", err);
    return { success: false, error: err.message || "Failed to remove user account" };
  }
}

export async function getAllUsersAdmin() {
  try {
    const adminClient = getAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError || !authData.users) {
      console.error("Error listing users:", authError);
      return [];
    }

    // Also fetch participants table details to enrich user profiles
    const { data: partData } = await adminClient.from('participants').select('*');
    const partMap = new Map<string, any>();
    if (partData) {
      partData.forEach(p => partMap.set(p.participant_id, p));
    }

    return authData.users.map(u => {
      const role = u.app_metadata?.role || 'student';
      const profile = partMap.get(u.id) || {};

      return {
        id: u.id,
        email: u.email || '',
        role: role,
        fullName: u.user_metadata?.full_name || profile.full_name || 'User',
        college: profile.college || 'N/A',
        department: profile.department || 'N/A',
        yearOfStudy: profile.year_of_study || '',
        registerNumber: profile.register_number || 'N/A',
        mobile: profile.mobile || '',
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        coordinatingEventId: u.app_metadata?.coordinating_event_id || null,
      };
    });
  } catch (err) {
    console.error("Error in getAllUsersAdmin:", err);
    return [];
  }
}
