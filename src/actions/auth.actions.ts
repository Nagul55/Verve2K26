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

export async function upsertParticipantProfile(adminClient: any, payload: any) {
  const { error } = await adminClient
    .from('participants')
    .upsert(payload, { onConflict: 'participant_id' });

  if (error) {
    if (error.code === 'PGRST204' || (error.message && error.message.toLowerCase().includes('gender'))) {
      console.warn("Gender column missing in participants table, performing fallback upsert without gender column.");
      const { gender, ...payloadWithoutGender } = payload;
      const { error: fallbackErr } = await adminClient
        .from('participants')
        .upsert(payloadWithoutGender, { onConflict: 'participant_id' });

      if (fallbackErr) {
        console.error("Error inserting participant profile (fallback):", fallbackErr);
        return { error: fallbackErr.message };
      }
      return { success: true };
    }
    console.error("Error inserting participant profile:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function login(formData: FormData) {
  const email = ((formData.get('email') as string) || '').trim();
  const password = ((formData.get('password') as string) || '').trim();
  const supabase = await createClient();

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Auto-seed or repair default admin account if initial sign in fails for admin@eventrix.com
  if (error && email.toLowerCase() === 'admin@eventrix.com') {
    try {
      const adminClient = getAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existingAdmin = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === 'admin@eventrix.com'
      );

      if (existingAdmin) {
        await adminClient.auth.admin.updateUserById(existingAdmin.id, {
          password: password,
          app_metadata: { role: 'admin' },
          user_metadata: { full_name: existingAdmin.user_metadata?.full_name || 'Admin' },
        });
        await adminClient.from('participants').upsert(
          {
            participant_id: existingAdmin.id,
            full_name: existingAdmin.user_metadata?.full_name || 'Admin',
            email: 'admin@eventrix.com',
            mobile: '',
            college: '',
            department: '',
            year_of_study: '',
            register_number: '',
          },
          { onConflict: 'participant_id' }
        );
      } else {
        const { data: newAdmin } = await adminClient.auth.admin.createUser({
          email: 'admin@eventrix.com',
          password: password,
          email_confirm: true,
          app_metadata: { role: 'admin' },
          user_metadata: { full_name: 'Admin' },
        });

        if (newAdmin?.user) {
          await adminClient.from('participants').upsert(
            {
              participant_id: newAdmin.user.id,
              full_name: 'Admin',
              email: 'admin@eventrix.com',
              mobile: '',
              college: '',
              department: '',
              year_of_study: '',
              register_number: '',
            },
            { onConflict: 'participant_id' }
          );
        }
      }

      // Retry sign in after provisioning
      const retry = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      data = retry.data;
      error = retry.error;
    } catch (e) {
      console.error("Error auto-seeding admin account:", e);
    }
  }

  if (error || !data.user) {
    return { error: error?.message || "Invalid login credentials" };
  }

  // Check role from app_metadata
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
  const confirmPassword = (formData.get('confirmPassword') as string) || '';
  const fullName = (formData.get('fullName') as string) || '';
  const mobile = (formData.get('mobile') as string) || '';
  const college = (formData.get('college') as string) || '';
  const department = (formData.get('department') as string) || '';
  const yearOfStudy = (formData.get('yearOfStudy') as string) || '';
  const gender = ((formData.get('gender') as string) || '').trim().toUpperCase();

  if (
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !fullName.trim() ||
    !mobile.trim() ||
    !college.trim() ||
    !department.trim() ||
    !yearOfStudy.trim()
  ) {
    return { error: 'All fields are required. Please fill in all details.' };
  }

  if (!gender || (gender !== 'MALE' && gender !== 'FEMALE')) {
    return { error: 'Please select your gender.' };
  }

  if (!/^\d{10}$/.test(mobile.trim())) {
    return { error: '10 digits required' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please make sure your passwords match.' };
  }
  
  const adminClient = getAdminClient();

  // 1. Bypass email confirmation by using the Service Role admin API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Forces the account to be instantly active!
    app_metadata: { role: 'student' },
    user_metadata: { full_name: fullName, gender: gender }
  });

  if (authError) {
    return { error: authError.message };
  }

  // 3. Create the participant stub
  if (authData.user) {
    await upsertParticipantProfile(adminClient, {
      participant_id: authData.user.id,
      full_name: fullName,
      email: email,
      mobile: mobile,
      department: department,
      year_of_study: yearOfStudy,
      college: college,
      gender: gender,
      register_number: ''
    });
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
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';
  const confirmPassword = (formData.get('confirmPassword') as string) || '';
  const fullName = (formData.get('fullName') as string) || '';
  const mobile = (formData.get('mobile') as string) || '';
  const college = (formData.get('college') as string) || '';
  const department = (formData.get('department') as string) || '';
  const yearOfStudy = (formData.get('yearOfStudy') as string) || '';
  const subEventId = (formData.get('subEventId') as string) || '';
  const gender = ((formData.get('gender') as string) || '').trim().toUpperCase();
  
  if (
    !email.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    !fullName.trim() ||
    !mobile.trim() ||
    !college.trim() ||
    !department.trim() ||
    !yearOfStudy.trim()
  ) {
    return { error: 'All fields (Full Name, Phone Number, Email, Gender, College, Department, Year of Study, Password, Confirm Password) are required.' };
  }

  if (!gender || (gender !== 'MALE' && gender !== 'FEMALE')) {
    return { error: 'Please select your gender.' };
  }

  if (!/^\d{10}$/.test(mobile.trim())) {
    return { error: '10 digits required' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please ensure Password and Confirm Password match.' };
  }

  const adminClient = getAdminClient();
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'coordinator', coordinating_event_id: subEventId || null },
    user_metadata: { full_name: fullName, gender: gender }
  });
  
  if (error) {
    return { error: error.message };
  }

  if (data?.user) {
    const res = await upsertParticipantProfile(adminClient, {
      participant_id: data.user.id,
      full_name: fullName,
      email: email,
      mobile: mobile,
      department: department,
      year_of_study: yearOfStudy,
      college: college,
      gender: gender,
      register_number: ''
    });

    if (res.error) {
      console.error("Error creating participant profile for coordinator:", res.error);
    }
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
        gender: profile.gender || u.user_metadata?.gender || 'MALE',
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
