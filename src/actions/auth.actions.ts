"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
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

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const isMasterAdmin = email.toLowerCase() === 'admin@eventrix.com';

  // 1. Attempt standard sign in
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 2. Auto-seed / repair master admin if sign in failed or admin user needs setup
  if (isMasterAdmin && (error || !data?.user)) {
    try {
      const adminClient = getAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existingAdmin = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === 'admin@eventrix.com'
      );

      if (!existingAdmin) {
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

        // Retry sign in after provisioning
        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = retry.data;
        error = retry.error;
      }
    } catch (e) {
      console.error("Error auto-seeding admin account:", e);
    }
  }

  if (error || !data?.user) {
    return { error: error?.message || "Invalid login credentials. Please check your email and password." };
  }

  // 3. Ensure master admin role is synced to admin
  if (isMasterAdmin && data.user.app_metadata?.role !== 'admin') {
    try {
      const adminClient = getAdminClient();
      await adminClient.auth.admin.updateUserById(data.user.id, {
        app_metadata: {
          ...data.user.app_metadata,
          role: 'admin',
        },
      });
    } catch (e) {
      console.error("Error syncing admin role metadata:", e);
    }
  }

  // 4. Determine redirect path
  const userRole = isMasterAdmin ? 'admin' : (data.user.app_metadata?.role || 'student');

  if (userRole === 'admin') {
    return { success: true, redirectTo: '/admin' };
  } else if (userRole === 'coordinator') {
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

  const { data: partData } = await adminClient.from('participants').select('*');
  const partMap = new Map<string, any>();
  if (partData) {
    partData.forEach(p => partMap.set(p.participant_id, p));
  }
  
  // Filter users who have role = coordinator
  return data.users.filter(u => u.app_metadata?.role === 'coordinator').map(u => {
    const profile = partMap.get(u.id) || {};
    const subEventIds: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
      ? u.app_metadata.coordinating_event_ids
      : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];

    return {
      id: u.id,
      email: u.email,
      role: 'coordinator',
      gender: profile.gender || u.user_metadata?.gender || 'MALE',
      fullName: u.user_metadata?.full_name || profile.full_name || 'Coordinator',
      subEventId: subEventIds[0] || null,
      subEventIds: subEventIds
    };
  });
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
  const initialSubEventIds = subEventId ? [subEventId] : [];
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'coordinator', coordinating_event_ids: initialSubEventIds, coordinating_event_id: subEventId || null },
    user_metadata: { full_name: fullName, gender: gender, mobile: mobile, phone: mobile }
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

export async function updateCoordinatorAssignments(coordinatorId: string, subEventIds: string[]) {
  const adminClient = getAdminClient();
  const { data: userData } = await adminClient.auth.admin.getUserById(coordinatorId);
  const existingRole = userData?.user?.app_metadata?.role || 'coordinator';
  const roleToSet = existingRole === 'admin' ? 'admin' : 'coordinator';

  const { error } = await adminClient.auth.admin.updateUserById(coordinatorId, {
    app_metadata: {
      ...userData?.user?.app_metadata,
      role: roleToSet,
      coordinating_event_ids: subEventIds,
      coordinating_event_id: subEventIds[0] || null
    }
  });

  if (error) return { success: false, error: error.message };

  // Recalculate event status transitions for all subevents
  const { data: authData } = await adminClient.auth.admin.listUsers();
  const eventCoordCounts: Record<string, number> = {};

  if (authData?.users) {
    authData.users.forEach(u => {
      if (u.app_metadata?.role === 'coordinator') {
        const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
          ? u.app_metadata.coordinating_event_ids
          : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];
        ids.forEach(id => {
          eventCoordCounts[id] = (eventCoordCounts[id] || 0) + 1;
        });
      }
    });
  }

  const { data: subEvents } = await adminClient.from('sub_events').select('id, status');
  if (subEvents) {
    for (const ev of subEvents) {
      const count = eventCoordCounts[ev.id] || 0;
      if (count > 0 && ev.status === 'DRAFT') {
        await adminClient.from('sub_events').update({ status: 'PENDING_APPROVAL' }).eq('id', ev.id);
      } else if (count === 0 && (ev.status === 'PENDING_APPROVAL' || ev.status === 'LIVE')) {
        await adminClient.from('sub_events').update({ status: 'DRAFT' }).eq('id', ev.id);
      }
    }
  }

  try {
    (revalidateTag as any)('coordinators');
    (revalidateTag as any)('fests');
    revalidatePath('/admin');
    revalidatePath('/admin/coordinators');
    revalidatePath('/admin/sub-events');
    revalidatePath('/coordinator/events');
    revalidatePath('/events');
  } catch (e) {
    console.warn("Revalidation warning in updateCoordinatorAssignments:", e);
  }

  return { success: true };
}

export async function updateCoordinatorAssignment(coordinatorId: string, subEventId: string) {
  return updateCoordinatorAssignments(coordinatorId, subEventId ? [subEventId] : []);
}

export async function deleteCoordinator(coordinatorId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(coordinatorId);
  return { success: !error, error: error?.message };
}

export async function deleteUserAccount(userId: string) {
  try {
    const adminClient = getAdminClient();

    // 1. Delete associated registrations, attendance & team records
    await adminClient.from('attendance').delete().eq('participant_id', userId);
    await adminClient.from('event_registrations').delete().eq('participant_id', userId);
    await adminClient.from('registrations').delete().eq('participant_id', userId);
    
    // Delete from team_members first
    await adminClient.from('team_members').delete().eq('participant_id', userId);
    
    // If they were a team leader, delete the team as well
    await adminClient.from('teams').delete().eq('leader_participant_id', userId);

    // 2. Delete from participants profile table
    const { error: partError } = await adminClient.from('participants').delete().eq('participant_id', userId);
    if (partError) {
      console.error("Error deleting participant row:", partError);
    }

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
