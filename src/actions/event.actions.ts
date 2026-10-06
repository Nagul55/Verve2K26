"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendTicketEmail } from "./email.actions";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function getCoordinators() {
  const adminClient = getAdminClient();
  let allUsers: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users || data.users.length === 0) {
      hasMore = false;
    } else {
      allUsers = allUsers.concat(data.users);
      if (data.users.length < 1000) hasMore = false;
      else page++;
    }
  }
  
  return allUsers
    .filter(u => u.app_metadata?.role === 'coordinator')
    .map(u => {
      const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
        ? u.app_metadata.coordinating_event_ids
        : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];
      return {
        id: u.id,
        name: u.user_metadata?.full_name || u.email || 'Coordinator',
        phone: u.user_metadata?.mobile || u.user_metadata?.phone || u.phone || '',
        email: u.email || '',
        event_ids: ids
      };
    });
}

export const getCachedCoordinators = getCoordinators;


async function getAllAuthUsers(adminClient: any) {
  // Kept for backward compatibility if needed elsewhere, but should be avoided.
  let allUsers: any[] = [];
  let page = 1;
  const perPage = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users || data.users.length === 0) {
      hasMore = false;
    } else {
      allUsers = allUsers.concat(data.users);
      if (data.users.length < perPage) hasMore = false;
      else page++;
    }
  }
  return { data: { users: allUsers } };
}

// FESTS
export async function getFests() {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.from('fests').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function getFestById(festId: string) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.from('fests').select('*').eq('id', festId).single();
  if (error) return null;
  return data;
}

export async function createFest(
  name: string, 
  description: string, 
  minTech: number = 0, 
  minNonTech: number = 0,
  registrationClosesAt?: string | null
) {
  const adminClient = getAdminClient();
  const payload: any = {
    name,
    description,
    min_technical: minTech,
    min_non_technical: minNonTech
  };

  if (registrationClosesAt) {
    payload.registration_closes_at = new Date(registrationClosesAt).toISOString();
  }

  const { data, error } = await adminClient.from('fests').insert(payload);
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  revalidatePath('/events');
  return { success: !error, error: error?.message };
}

export async function updateFest(
  festId: string,
  name: string, 
  description: string, 
  minTech: number = 0, 
  minNonTech: number = 0,
  registrationClosesAt?: string | null
) {
  const adminClient = getAdminClient();
  const payload: any = {
    name,
    description,
    min_technical: minTech,
    min_non_technical: minNonTech,
    registration_closes_at: registrationClosesAt ? new Date(registrationClosesAt).toISOString() : null
  };

  const { error } = await adminClient.from('fests').update(payload).eq('id', festId);
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  revalidatePath('/events');
  return { success: !error, error: error?.message };
}

export async function deleteFest(festId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.from('fests').delete().eq('id', festId);
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  revalidatePath('/events');
  return { success: !error, error: error?.message };
}

// SUB-EVENTS
export async function getSubEvents(festId?: string, includePending: boolean = false) {
  const adminClient = getAdminClient();
  let query = adminClient.from('sub_events').select('*');
  if (festId) query = query.eq('fest_id', festId);
  
  const { data, error } = await query;
  if (error || !data) return [];

  // Query coordinators from CACHED Supabase Auth users
  const coords = await getCachedCoordinators();
  const eventCoordMap: Record<string, string[]> = {};
  const eventCoordDetails: Record<string, Array<{ name: string; phone: string; email: string }>> = {};

  coords.forEach(c => {
    c.event_ids.forEach(id => {
      if (!eventCoordMap[id]) eventCoordMap[id] = [];
      if (!eventCoordDetails[id]) eventCoordDetails[id] = [];
      eventCoordMap[id].push(c.name);
      eventCoordDetails[id].push({ name: c.name, phone: c.phone, email: c.email });
    });
  });

  // Student Query (includePending === false): ONLY return LIVE events with >= 1 coordinator assigned!
  if (!includePending) {
    return data
      .filter(e => e.status === 'LIVE' && (eventCoordMap[e.id]?.length || 0) > 0)
      .map(e => ({
        ...e,
        coordinatorNames: eventCoordMap[e.id] || [],
        coordinatorDetails: eventCoordDetails[e.id] || []
      }));
  }

  // Admin Query (includePending === true): Attach coordinator info & count
  return data.map(e => ({
    ...e,
    coordinatorNames: eventCoordMap[e.id] || [],
    coordinatorDetails: eventCoordDetails[e.id] || [],
    coordinatorCount: eventCoordMap[e.id]?.length || 0
  }));
}

export async function createSubEvent(subEventData: any) {
  const adminClient = getAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isCoordinator = user?.app_metadata?.role === 'coordinator';
  
  // Format candidate/team requirements into description if present
  let formattedDesc = subEventData.description || '';
  if (subEventData.participation_type === 'Team' && (subEventData.min_candidates || subEventData.max_candidates)) {
    const minC = subEventData.min_candidates || 1;
    const maxC = subEventData.max_candidates || 1;
    if (!formattedDesc.includes('[Team Size:')) {
      formattedDesc = `[Team Size: ${minC} to ${maxC} Members]\n\n` + formattedDesc;
    }
  }

  if (subEventData.rules && subEventData.rules.trim() && !formattedDesc.includes('RULES & GUIDELINES:')) {
    formattedDesc += `\n\nRULES & GUIDELINES:\n${subEventData.rules.trim()}`;
  }
  if (subEventData.prize_pool && subEventData.prize_pool.trim() && !formattedDesc.includes('PRIZES:')) {
    formattedDesc += `\n\nPRIZES:\n${subEventData.prize_pool.trim()}`;
  }

  if (subEventData.resources && Array.isArray(subEventData.resources) && subEventData.resources.length > 0 && !formattedDesc.includes('[EVENT_RESOURCES:')) {
    formattedDesc += `\n\n[EVENT_RESOURCES: ${JSON.stringify(subEventData.resources)}]`;
  }

  // Only pass columns that exist in the Supabase sub_events table schema
  const cleanPayload: any = {
    fest_id: subEventData.fest_id || '5a567e01-9c0f-47aa-8960-c09dd88afae5',
    title: subEventData.title,
    description: formattedDesc,
    category: subEventData.category || 'Technical',
    participation_type: subEventData.participation_type || 'Individual',
    min_candidates: subEventData.min_candidates ? parseInt(subEventData.min_candidates) : 1,
    max_candidates: subEventData.max_candidates ? parseInt(subEventData.max_candidates) : 1,
    date: subEventData.date || 'TBD',
    time: subEventData.time || 'TBD',
    location: subEventData.location,
    capacity: typeof subEventData.capacity === 'number' ? subEventData.capacity : parseInt(subEventData.capacity || '100'),
    status: isCoordinator ? 'PENDING_APPROVAL' : 'DRAFT'
  };

  const { data, error } = await adminClient.from('sub_events').insert(cleanPayload).select('id').single();

  if (!error && data?.id && isCoordinator && user) {
    // Automatically bind the new sub-event ID to the authenticated coordinator
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const existingIds: string[] = Array.isArray(user.app_metadata?.coordinating_event_ids)
      ? user.app_metadata.coordinating_event_ids
      : user.app_metadata?.coordinating_event_id ? [user.app_metadata.coordinating_event_id] : [];
    if (!existingIds.includes(data.id)) {
      await updateCoordinatorAssignments(user.id, [...existingIds, data.id]);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/sub-events');
  revalidatePath('/coordinator/events');
  return { success: !error, error: error?.message };
}

export async function approveSubEvent(subEventId: string, coordinatorIds?: string[]) {
  const adminClient = getAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If coordinatorIds were supplied during approval, assign them to subevent
  if (coordinatorIds && Array.isArray(coordinatorIds) && coordinatorIds.length > 0) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    for (const cId of coordinatorIds) {
      const { data: userData } = await adminClient.auth.admin.getUserById(cId);
      if (userData?.user) {
        const existingIds: string[] = Array.isArray(userData.user.app_metadata?.coordinating_event_ids)
          ? userData.user.app_metadata.coordinating_event_ids
          : userData.user.app_metadata?.coordinating_event_id ? [userData.user.app_metadata.coordinating_event_id] : [];
        if (!existingIds.includes(subEventId)) {
          await updateCoordinatorAssignments(cId, [...existingIds, subEventId]);
        }
      }
    }
  }

  // Purge tag cache to ensure we get live coordinator list
  try {
    (revalidateTag as any)('coordinators');
  } catch (e) {
    // Ignore cache error in dev edge cases
  }

  // Server-side Rule Validation: Enforce that at least one coordinator MUST be assigned before approval
  const coords = await getCachedCoordinators();
  const assignedCoords = coords.filter(c => c.event_ids.includes(subEventId));

  if (assignedCoords.length === 0) {
    return { 
      success: false, 
      error: "Coordinator required — Assign at least one coordinator before approving this event." 
    };
  }

  const { error } = await adminClient
    .from('sub_events')
    .update({
      status: 'LIVE',
      approved_by: user?.id || null,
      approved_at: new Date().toISOString()
    })
    .eq('id', subEventId);

  try {
    (revalidateTag as any)('coordinators');
    (revalidateTag as any)('fests');
    revalidatePath('/admin');
    revalidatePath('/admin/sub-events');
    revalidatePath('/admin/coordinators');
    revalidatePath('/coordinator/events');
    revalidatePath('/events');
  } catch (e) {
    // Ignore cache revalidation edge cases
  }

  return { success: !error, error: error?.message };
}

export async function approveAndPermitSubEvent(subEventId: string, coordinatorId?: string) {
  const coordIds = coordinatorId && coordinatorId.trim() ? [coordinatorId] : [];
  return approveSubEvent(subEventId, coordIds);
}

export async function rejectSubEvent(subEventId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from('sub_events')
    .update({ status: 'REJECTED' })
    .eq('id', subEventId);

  revalidatePath('/admin');
  revalidatePath('/admin/sub-events');
  revalidatePath('/admin/coordinators');
  revalidatePath('/coordinator/events');
  revalidatePath('/events');
  return { success: !error, error: error?.message };
}

export async function deleteSubEvent(subEventId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.from('sub_events').delete().eq('id', subEventId);
  revalidatePath('/admin');
  revalidatePath('/admin/sub-events');
  return { success: !error, error: error?.message };
}

export async function getSubEventById(subEventId: string) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.from('sub_events').select('*').eq('id', subEventId).single();
  if (error || !data) return null;

  let desc = data.description || '';
  let resources: any[] = [];
  let rules = '';
  let prize_pool = '';
  let contact_info = '';

  // Parse resources
  const resMatch = desc.match(/\[EVENT_RESOURCES:\s*(\[[\s\S]*?\])\]/);
  if (resMatch) {
    try {
      resources = JSON.parse(resMatch[1]);
    } catch (err) {
      console.error("Failed to parse event resources JSON:", err);
    }
    desc = desc.replace(/\[EVENT_RESOURCES:\s*\[[\s\S]*?\]\]/, '').trim();
  }

  // Parse contact info
  const contactMatch = desc.match(/\n\nCONTACT:\s*([\s\S]*?)(?=\n\n|$)/);
  if (contactMatch) {
    contact_info = contactMatch[1].trim();
    desc = desc.replace(/\n\nCONTACT:\s*[\s\S]*?(?=\n\n|$)/, '').trim();
  }

  // Parse prizes
  const prizeMatch = desc.match(/\n\nPRIZES:\n([\s\S]*?)(?=\n\nRULES & GUIDELINES:|$)/);
  if (prizeMatch) {
    prize_pool = prizeMatch[1].trim();
    desc = desc.replace(/\n\nPRIZES:\n[\s\S]*?(?=\n\nRULES & GUIDELINES:|$)/, '').trim();
  }

  // Parse rules
  const rulesMatch = desc.match(/\n\nRULES & GUIDELINES:\n([\s\S]*?)$/);
  if (rulesMatch) {
    rules = rulesMatch[1].trim();
    desc = desc.replace(/\n\nRULES & GUIDELINES:\n[\s\S]*?$/, '').trim();
  }

  // Parse team size tag
  const teamMatch = desc.match(/^\[Team Size:\s*\d+\s*to\s*\d+\s*Members\]\n\n?/);
  if (teamMatch) {
    desc = desc.replace(/^\[Team Size:\s*\d+\s*to\s*\d+\s*Members\]\n\n?/, '').trim();
  }

  // Fetch coordinator details for this event
  const coords = await getCachedCoordinators();
  const coordinatorDetails = coords.filter(c => c.event_ids.includes(subEventId)).map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email
  }));

  return {
    ...data,
    cleanDescription: desc,
    rules,
    prize_pool,
    contact_info,
    resources,
    coordinatorDetails
  };
}

export async function updateSubEvent(subEventId: string, subEventData: any) {
  const adminClient = getAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const role = user.app_metadata?.role;
  const isCoordinator = role === 'coordinator';
  const isAdmin = role === 'admin';

  if (isCoordinator) {
    const existingIds: string[] = Array.isArray(user.app_metadata?.coordinating_event_ids)
      ? user.app_metadata.coordinating_event_ids
      : user.app_metadata?.coordinating_event_id ? [user.app_metadata.coordinating_event_id] : [];
    if (!existingIds.includes(subEventId)) {
      return { success: false, error: "Unauthorized: You can only edit sub-events assigned to you." };
    }
  } else if (!isAdmin) {
    return { success: false, error: "Unauthorized access." };
  }

  // Fetch current event to check status
  const { data: currentEvent } = await adminClient
    .from('sub_events')
    .select('status')
    .eq('id', subEventId)
    .single();

  // Format candidate/team requirements into description
  let formattedDesc = subEventData.description || '';
  if (subEventData.participation_type === 'Team' && (subEventData.min_candidates || subEventData.max_candidates)) {
    const minC = subEventData.min_candidates || 1;
    const maxC = subEventData.max_candidates || 1;
    if (!formattedDesc.includes('[Team Size:')) {
      formattedDesc = `[Team Size: ${minC} to ${maxC} Members]\n\n` + formattedDesc;
    }
  }

  if (subEventData.rules && subEventData.rules.trim()) {
    formattedDesc += `\n\nRULES & GUIDELINES:\n${subEventData.rules.trim()}`;
  }
  if (subEventData.prize_pool && subEventData.prize_pool.trim()) {
    formattedDesc += `\n\nPRIZES:\n${subEventData.prize_pool.trim()}`;
  }
  if (subEventData.contact_info && subEventData.contact_info.trim()) {
    formattedDesc += `\n\nCONTACT: ${subEventData.contact_info.trim()}`;
  }
  if (subEventData.resources && Array.isArray(subEventData.resources) && subEventData.resources.length > 0) {
    formattedDesc += `\n\n[EVENT_RESOURCES: ${JSON.stringify(subEventData.resources)}]`;
  }

  // Determine updated status according to requirement #23
  // If coordinator edits a LIVE event, it returns to PENDING_APPROVAL for Admin review.
  let newStatus = currentEvent?.status || 'DRAFT';
  if (isCoordinator && currentEvent?.status === 'LIVE') {
    newStatus = 'PENDING_APPROVAL';
  } else if (subEventData.status) {
    newStatus = subEventData.status;
  }

  const updatePayload: any = {
    title: subEventData.title,
    description: formattedDesc,
    category: subEventData.category || 'Technical',
    participation_type: subEventData.participation_type || 'Individual',
    min_candidates: subEventData.min_candidates ? parseInt(subEventData.min_candidates) : 1,
    max_candidates: subEventData.max_candidates ? parseInt(subEventData.max_candidates) : 1,
    date: subEventData.date || 'TBD',
    time: subEventData.time || 'TBD',
    location: subEventData.location,
    capacity: typeof subEventData.capacity === 'number' ? subEventData.capacity : parseInt(subEventData.capacity || '100'),
    status: newStatus
  };

  const { error } = await adminClient.from('sub_events').update(updatePayload).eq('id', subEventId);

  revalidatePath('/admin/sub-events');
  revalidatePath('/coordinator/events');
  revalidatePath('/events');
  revalidatePath('/dashboard');

  return { 
    success: !error, 
    error: error?.message,
    statusChangedToPending: isCoordinator && currentEvent?.status === 'LIVE'
  };
}

// REGISTRATIONS
export async function registerForEvents(
  festId: string,
  subEventIds: string[],
  teamNames?: Record<string, string>,
  teamMembers?: Record<string, string>
) {
  const supabase = await createClient();
  
  // 1. Get/Update Participant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: participant } = await supabase.from('participants').select('*').eq('participant_id', user.id).single();
  if (!participant) return { success: false, error: "Participant profile not found. Please update settings first." };
  
  const adminClient = getAdminClient();

  // 1.2 FEST REGISTRATION DEADLINE CHECK (SERVER-SIDE MANDATORY)
  const { data: festData } = await adminClient
    .from('fests')
    .select('registration_closes_at')
    .eq('id', festId)
    .maybeSingle();

  if (festData?.registration_closes_at && new Date() >= new Date(festData.registration_closes_at)) {
    return { success: false, error: "Registration for this fest has closed." };
  }

  // 1.5 Validate all Team Member Emails in a single batch query
  const validMemberParticipants: Record<string, any[]> = {}; 

  if (teamMembers && Object.keys(teamMembers).length > 0) {
    const allEmailsToFetch = Array.from(new Set(
      Object.values(teamMembers)
        .flatMap(str => str.split(',').map(e => e.trim()).filter(e => e))
    ));

    let fetchedParticipants: any[] = [];
    if (allEmailsToFetch.length > 0) {
      const { data } = await adminClient
        .from('participants')
        .select('*')
        .in('email', allEmailsToFetch);
      fetchedParticipants = data || [];
    }

    for (const [subEventId, membersEmailsStr] of Object.entries(teamMembers)) {
      const emails = membersEmailsStr.split(',').map(e => e.trim()).filter(e => e);
      const validParts = [];
      for (const email of emails) {
        if (email.toLowerCase() === participant.email?.toLowerCase()) {
          return { success: false, error: "Team Leader is automatically included. Do not add leader email as a member." };
        }
        const memberPart = fetchedParticipants.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (!memberPart) {
          return { success: false, error: `Team member with email ${email} not found. Please ensure they have registered an account.` };
        }
        validParts.push(memberPart);
      }
      validMemberParticipants[subEventId] = validParts;
    }
  }

  // 1.8 CAPACITY & TEAM MIN/MAX SIZE VALIDATION (SERVER-SIDE ENFORCEMENT)
  if (subEventIds.length > 0) {
    const { data: subEventsInfo } = await adminClient
      .from('sub_events')
      .select('id, title, capacity, participation_type, min_candidates, max_candidates')
      .in('id', subEventIds);

    for (const sub of (subEventsInfo || [])) {
      // Check Capacity / Seats Available
      const { count: occupiedCount } = await adminClient
        .from('registration_sub_events')
        .select('*', { count: 'exact', head: true })
        .eq('sub_event_id', sub.id);

      const capacity = typeof sub.capacity === 'number' ? sub.capacity : 50;
      if ((occupiedCount || 0) >= capacity) {
        return { success: false, error: `No seats available for ${sub.title}. (Capacity: ${capacity})` };
      }

      // Check Team Min / Max size
      if (sub.participation_type === 'Team') {
        const membersList = validMemberParticipants[sub.id] || [];
        const totalTeamSize = 1 + membersList.length; // Leader + Members
        const minSize = sub.min_candidates || 2;
        const maxSize = sub.max_candidates || 5;

        if (totalTeamSize < minSize) {
          return { 
            success: false, 
            error: `Team size for ${sub.title} must be at least ${minSize} members. Current team size is ${totalTeamSize} (1 Leader + ${membersList.length} member/s).` 
          };
        }
        if (totalTeamSize > maxSize) {
          return { 
            success: false, 
            error: `Team size for ${sub.title} cannot exceed ${maxSize} members. Current team size is ${totalTeamSize}.` 
          };
        }
      }
    }
  }

  // 2. Create Fest Registration or Get Existing
  
  // Try to insert
  let festRegId;
  const { data: newFestReg, error: festRegError } = await adminClient
    .from('registrations')
    .insert({
      participant_id: user.id,
      fest_id: festId
    })
    .select('id')
    .single();

  if (festRegError) {
    // If it's a unique violation, just get the existing registration
    const { data: existingReg } = await adminClient
      .from('registrations')
      .select('id')
      .eq('participant_id', user.id)
      .eq('fest_id', festId)
      .single();
      
    if (existingReg) {
      festRegId = existingReg.id;
    } else {
      return { success: false, error: festRegError.message || "Failed to create registration" };
    }
  } else {
    festRegId = newFestReg.id;
  }

  // 3. Insert Sub-Events (filtering out ones already registered)
  const { data: existingSubEvents } = await adminClient
    .from('registration_sub_events')
    .select('sub_event_id')
    .eq('registration_id', festRegId);

  const existingIds = existingSubEvents ? existingSubEvents.map(e => e.sub_event_id) : [];
  const newSubEventIds = subEventIds.filter(id => !existingIds.includes(id));

  if (newSubEventIds.length > 0) {
    const subEventsData = newSubEventIds.map(subId => ({
      registration_id: festRegId,
      sub_event_id: subId
    }));

    const { error: subError } = await adminClient
      .from('registration_sub_events')
      .upsert(subEventsData, { onConflict: 'registration_id,sub_event_id', ignoreDuplicates: true });
    if (subError) return { success: false, error: subError.message };
  }

  // 3.5 Create Teams if provided
  if (teamNames && Object.keys(teamNames).length > 0) {
    for (const [subEventId, teamName] of Object.entries(teamNames)) {
      if (teamName.trim() !== '') {
        const { data: newTeam, error: teamError } = await adminClient
          .from('teams')
          .insert({
            team_name: teamName,
            event_id: subEventId,
            leader_participant_id: participant.participant_id,
            status: 'Approved'
          })
          .select('team_id')
          .single();

        if (teamError || !newTeam) {
          console.error("CRITICAL ERROR: Failed to create team in database:", teamError);
          return { success: false, error: "Database error: Could not create team. " + (teamError?.message || '') };
        }

        if (newTeam) {
          // Add leader to team
          const { error: tmError1 } = await adminClient
            .from('team_members')
            .insert({
              team_id: newTeam.team_id,
              participant_id: participant.participant_id,
              status: 'Accepted'
            });
          
          if (tmError1) {
            console.error("CRITICAL ERROR: Failed to add leader to team_members:", tmError1);
          }

          // Process extra team members as PENDING invitations
          const validParts = validMemberParticipants[subEventId] || [];

          for (const memberPart of validParts) {
            // 1. Add them to the team as Pending
            await adminClient.from('team_members').insert({
              team_id: newTeam.team_id,
              participant_id: memberPart.participant_id,
              status: 'Pending'
            });
            // 2. We do NOT register them for the Fest or SubEvent yet, 
            // and we do NOT send them a ticket yet.
            // They will receive this when they ACCEPT the invitation.
          }
        }
      }
    }
  }

  // 4. Send Email
  const { data: bookedEvents } = await adminClient.from('sub_events').select('*').in('id', subEventIds);
  if (bookedEvents && bookedEvents.length > 0) {
    await sendTicketEmail(participant.email, participant.full_name, bookedEvents);
  }

  revalidatePath('/dashboard');
  revalidatePath('/registrations');
  return { success: true };
}

export async function getParticipantRegistrations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = getAdminClient();

  // Query registrations for this participant, join with registration_sub_events, sub_events, and fests
  const { data, error } = await adminClient
    .from('registrations')
    .select(`
      id,
      fests (
        id,
        name
      ),
      registration_sub_events (
        sub_events (
          id,
          title,
          category,
          date,
          location,
          time,
          participation_type
        )
      )
    `)
    .eq('participant_id', user.id);

  if (error || !data) return [];

  // Fetch teams for this participant to show team details for team events
  const { data: teamsData, error: teamsError } = await adminClient
    .from('team_members')
    .select(`
      team_id,
      teams (
        team_id,
        team_name,
        event_id,

        leader_participant_id,
        is_locked,
        team_members (
          participant_id,
          status,
          participants (
            full_name
          )
        )
      )
    `)
    .eq('participant_id', user.id);

  if (teamsError) {
    console.error("Error fetching teamsData in getParticipantRegistrations:", teamsError);
  }

  const userTeams: Record<string, any> = {};
  if (teamsData) {
    teamsData.forEach((tm: any) => {
       if (tm.teams) {
         // Handle both possible column names in case schema varied
         const eventId = tm.teams.sub_event_id || tm.teams.event_id;
         if (eventId) {
           userTeams[eventId] = {
             teamId: tm.teams.team_id,
             teamName: tm.teams.team_name,
             isLeader: tm.teams.leader_participant_id === user.id,
             isLocked: tm.teams.is_locked,
             members: tm.teams.team_members?.map((m: any) => ({
               participantId: m.participant_id,
               name: m.participants?.full_name,
               status: m.status || 'Accepted'
             })).filter((m: any) => m.name) || []
           };
         }
       }
    });
  }

  // Flatten the result
  const registeredEvents: any[] = [];
  data.forEach((reg: any) => {
    reg.registration_sub_events.forEach((rse: any) => {
      if (rse.sub_events) {
        registeredEvents.push({
          ...rse.sub_events,
          festName: reg.fests?.name || 'Fest',
          teamDetails: userTeams[rse.sub_events.id] || null,
          ticketNumber: `TKT-${reg.id.split('-')[0].toUpperCase()}-${rse.sub_events.id.split('-')[0].toUpperCase()}`
        });
      }
    });
  });

  return registeredEvents;
}

export async function getAdminParticipants() {
  const adminClient = getAdminClient();

  const { data, error } = await adminClient
    .from('participants')
    .select(`
      participant_id,
      full_name,
      email,
      mobile,
      college,
      register_number,
      department,
      year_of_study,
      section,
      created_at,
      registrations!inner (
        id,
        fest_id,
        created_at,
        registration_sub_events!inner (
          sub_events (
            id,
            title,
            category,
            date,
            location,
            time
          )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error("Error fetching admin registered participants:", error);
    return [];
  }

  // Ensure participants have at least one valid sub-event booking
  const registeredParticipants = data.filter((p: any) => {
    if (!p.registrations || p.registrations.length === 0) return false;
    return p.registrations.some((reg: any) => 
      reg.registration_sub_events && 
      reg.registration_sub_events.length > 0 &&
      reg.registration_sub_events.some((rse: any) => rse.sub_events)
    );
  });

  return registeredParticipants.map((p: any) => ({
    ...p,
    id: p.participant_id
  }));
}

export async function getCoordinatorParticipants() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { assignedEventIds } = await getCoordinatorAssignedEventIds(user.id);
  const adminClient = getAdminClient();

  if (!assignedEventIds || assignedEventIds.length === 0) {
     return [];
  }

  const { data, error } = await adminClient
    .from('registration_sub_events')
    .select(`
      sub_event_id,
      registrations (
        id,
        participant_id,
        participants (
          participant_id,
          full_name,
          email,
          register_number,
          mobile,
          college,
          department,
          year_of_study
        )
      )
    `)
    .in('sub_event_id', assignedEventIds);

  if (error || !data) {
    console.error("Error fetching coordinator participants:", error);
    return [];
  }

  // Fetch attendance for assigned events
  const { data: attendanceData } = await adminClient
    .from('attendance')
    .select('participant_id, event_id')
    .in('event_id', assignedEventIds)
    .eq('status', 'Present');
    
  const presentParticipantSet = new Set(
    (attendanceData || []).map(a => `${a.event_id}_${a.participant_id}`)
  );

  const participantsMap = new Map<string, any>();
  data.forEach((row: any) => {
    const p = row.registrations?.participants;
    const subEventId = row.sub_event_id;
    if (p && p.participant_id) {
       const key = `${subEventId}_${p.participant_id}`;
       if (!participantsMap.has(key)) {
         participantsMap.set(key, {
           ...p,
           id: p.participant_id,
           subEventId: subEventId,
           isPresent: presentParticipantSet.has(key)
         });
       }
    }
  });

  return Array.from(participantsMap.values());
}

export interface EventParticipant {
  registrationId: string;
  participantId: string;
  fullName: string;
  email: string;
  registerNumber: string;
  mobile: string;
  college: string;
  department: string;
  yearOfStudy: string;
  attendanceStatus: 'PRESENT' | 'PENDING';
}

export interface CoordinatorEventGroup {
  event: {
    id: string;
    title: string;
    category: string;
    format: string;
    event_date: string;
    event_time: string;
    venue: string;
    status: string;
  };
  statistics: {
    total: number;
    present: number;
    pending: number;
  };
  participants: EventParticipant[];
}

export async function getCoordinatorAssignedEventIds(userId: string): Promise<{ assignedEventIds: string[]; role: string }> {
  const adminClient = getAdminClient();
  const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);
  if (userError || !userData?.user) {
    return { assignedEventIds: [], role: 'student' };
  }

  const user = userData.user;
  const role = user.app_metadata?.role || 'coordinator';
  const assignedEventData = user.app_metadata?.coordinating_event_ids || user.app_metadata?.coordinating_event_id;

  let assignedEventIds: string[] = [];
  if (Array.isArray(assignedEventData)) {
    assignedEventIds = assignedEventData;
  } else if (typeof assignedEventData === 'string') {
    assignedEventIds = assignedEventData.split(',').map(id => id.trim()).filter(Boolean);
  }

  return { assignedEventIds, role };
}

export async function getCoordinatorEventsWithParticipants(): Promise<CoordinatorEventGroup[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { assignedEventIds, role } = await getCoordinatorAssignedEventIds(user.id);
  const isAdmin = role === 'admin' || role === 'Super Admin';

  const adminClient = getAdminClient();
  let eventQuery = adminClient
    .from('sub_events')
    .select('id, title, category, participation_type, date, time, location, status')
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    if (assignedEventIds.length === 0) {
      return [];
    }
    eventQuery = eventQuery.in('id', assignedEventIds);
  }

  const { data: events, error: eventsErr } = await eventQuery;
  if (eventsErr || !events) {
    console.error("Error fetching sub events for coordinator:", eventsErr);
    return [];
  }

  const result: CoordinatorEventGroup[] = [];

  for (const event of events) {
    // Fetch registration rows for this sub_event
    const { data: regData, error: regErr } = await adminClient
      .from('registration_sub_events')
      .select(`
        sub_event_id,
        registrations (
          id,
          participant_id,
          participants (
            participant_id,
            full_name,
            email,
            register_number,
            mobile,
            college,
            department,
            year_of_study
          )
        )
      `)
      .eq('sub_event_id', event.id);

    if (regErr) {
      console.error(`Error fetching registrations for event ${event.id}:`, regErr);
    }

    // Fetch attendance for this specific event
    const { data: attendanceData } = await adminClient
      .from('attendance')
      .select('participant_id')
      .eq('event_id', event.id)
      .eq('status', 'Present');

    const presentSet = new Set((attendanceData || []).map(a => a.participant_id));

    // Map participants for this event
    const participants: EventParticipant[] = [];
    const seenPartIds = new Set<string>();

    (regData || []).forEach((row: any) => {
      const reg = row.registrations;
      const p = reg?.participants;
      if (p && p.participant_id && !seenPartIds.has(p.participant_id)) {
        seenPartIds.add(p.participant_id);
        const isPresent = presentSet.has(p.participant_id);
        participants.push({
          registrationId: reg.id || '',
          participantId: p.participant_id,
          fullName: p.full_name || 'N/A',
          email: p.email || 'N/A',
          registerNumber: p.register_number || 'N/A',
          mobile: p.mobile || 'N/A',
          college: p.college || 'N/A',
          department: p.department || 'N/A',
          yearOfStudy: p.year_of_study || '',
          attendanceStatus: isPresent ? 'PRESENT' : 'PENDING'
        });
      }
    });

    const presentCount = participants.filter(p => p.attendanceStatus === 'PRESENT').length;
    const pendingCount = participants.filter(p => p.attendanceStatus === 'PENDING').length;

    result.push({
      event: {
        id: event.id,
        title: event.title || 'Untitled Event',
        category: event.category || 'Technical',
        format: event.participation_type || 'Individual',
        event_date: event.date || '',
        event_time: event.time || '',
        venue: event.location || '',
        status: event.status || 'LIVE'
      },
      statistics: {
        total: participants.length,
        present: presentCount,
        pending: pendingCount
      },
      participants
    });
  }

  return result;
}

export async function toggleParticipantAttendance(
  eventId: string,
  participantId: string,
  targetStatus: 'PRESENT' | 'PENDING'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized: User not authenticated' };
  }

  const { assignedEventIds, role } = await getCoordinatorAssignedEventIds(user.id);
  const isAdmin = role === 'admin' || role === 'Super Admin';

  if (!isAdmin && !assignedEventIds.includes(eventId)) {
    return { success: false, error: 'Forbidden: You are not assigned to coordinate this event.' };
  }

  const adminClient = getAdminClient();

  if (targetStatus === 'PRESENT') {
    // Find registration ID
    const { data: regSubEvent } = await adminClient
      .from('registration_sub_events')
      .select('sub_event_id, registrations(id, participant_id)')
      .eq('sub_event_id', eventId);

    let registrationId = null;
    if (regSubEvent) {
      const match = regSubEvent.find((r: any) => {
        const reg = Array.isArray(r.registrations) ? r.registrations[0] : r.registrations;
        return reg?.participant_id === participantId;
      });
      if (match) {
        const reg = Array.isArray(match.registrations) ? match.registrations[0] : match.registrations;
        registrationId = reg?.id || null;
      }
    }

    const { data: existing } = await adminClient
      .from('attendance')
      .select('attendance_id')
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .maybeSingle();

    if (!existing) {
      const { error: insErr } = await adminClient
        .from('attendance')
        .insert([{
          participant_id: participantId,
          event_id: eventId,
          registration_id: registrationId,
          status: 'Present',
          scanner_admin_id: user.id,
          source: 'Manual_Coordinator'
        }]);

      if (insErr) {
        console.error("Error marking attendance present:", insErr);
        return { success: false, error: insErr.message || 'Failed to record attendance.' };
      }
    }
  } else {
    // Delete attendance record for this event and participant
    const { error: delErr } = await adminClient
      .from('attendance')
      .delete()
      .eq('event_id', eventId)
      .eq('participant_id', participantId);

    if (delErr) {
      console.error("Error reverting attendance:", delErr);
      return { success: false, error: delErr.message || 'Failed to revert attendance.' };
    }
  }

  revalidatePath('/coordinator/participants');
  revalidatePath('/coordinator/attendance');
  revalidatePath('/admin');

  return { success: true };
}

export async function getStudentRegisteredEventIds() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = getAdminClient();
  const { data: registrations, error } = await adminClient
    .from('registrations')
    .select(`
      registration_sub_events (
        sub_event_id
      )
    `)
    .eq('participant_id', user.id);

  if (error || !registrations) return [];

  const registeredIds: string[] = [];
  registrations.forEach((reg: any) => {
    reg.registration_sub_events?.forEach((rse: any) => {
      if (rse.sub_event_id && !registeredIds.includes(rse.sub_event_id)) {
        registeredIds.push(rse.sub_event_id);
      }
    });
  });

  return registeredIds;
}

export async function getSubEventRegistrationCounts() {
  const adminClient = getAdminClient();
  const { data } = await adminClient
    .from('registration_sub_events')
    .select('sub_event_id');

  const counts: Record<string, number> = {};
  if (data) {
    data.forEach((item: any) => {
      if (item.sub_event_id) {
        counts[item.sub_event_id] = (counts[item.sub_event_id] || 0) + 1;
      }
    });
  }
  return counts;
}

export async function getSubEventsWithCoordinators(festId?: string) {
  const adminClient = getAdminClient();
  const fests = await getFests();
  const targetFest = (festId ? fests.find(f => f.id === festId) : null) || fests.find(f => f.name.toLowerCase().includes('verve')) || fests[0];

  if (!targetFest) return { fest: null, subEvents: [] };

  const { data: subEvents } = await adminClient
    .from('sub_events')
    .select('*')
    .eq('fest_id', targetFest.id)
    .order('category', { ascending: false })
    .order('title', { ascending: true });

  const coords = await getCachedCoordinators();
  const eventCoordMap: Record<string, string[]> = {};
  
  coords.forEach(c => {
    c.event_ids.forEach(id => {
      if (!eventCoordMap[id]) eventCoordMap[id] = [];
      if (!eventCoordMap[id].includes(c.name)) {
        eventCoordMap[id].push(c.name);
      }
    });
  });

  const enrichedSubEvents = (subEvents || []).map(event => {
    const names = eventCoordMap[event.id] || [];
    const coordinatorCount = names.length;
    const effectiveStatus = (event.status === 'LIVE' && coordinatorCount > 0)
      ? 'LIVE'
      : (event.status === 'LIVE' ? 'DRAFT' : (event.status || 'DRAFT'));

    return {
      ...event,
      status: effectiveStatus,
      parentFestName: targetFest.name,
      coordinatorNames: names,
      coordinatorName: names.length > 0 ? names.join(', ') : "Unassigned"
    };
  });

  return {
    fest: targetFest,
    subEvents: enrichedSubEvents
  };
}
