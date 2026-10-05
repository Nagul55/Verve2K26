"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendTicketEmail } from "./email.actions";
import { revalidatePath } from "next/cache";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

async function getAllAuthUsers(adminClient: any) {
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
  const { data, error } = await adminClient.from('fests').select('*');
  if (error) return [];
  return data;
}

export async function createFest(name: string, description: string, minTech: number = 0, minNonTech: number = 0) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient.from('fests').insert({
    name, description, min_technical: minTech, min_non_technical: minNonTech
  });
  return { success: !error, error: error?.message };
}

export async function deleteFest(festId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.from('fests').delete().eq('id', festId);
  return { success: !error, error: error?.message };
}

// SUB-EVENTS
export async function getSubEvents(festId?: string, includePending: boolean = false) {
  const adminClient = getAdminClient();
  let query = adminClient.from('sub_events').select('*');
  if (festId) query = query.eq('fest_id', festId);
  
  const { data, error } = await query;
  if (error || !data) return [];

  // Query coordinators from Supabase Auth users
  const { data: authData } = await getAllAuthUsers(adminClient);
  const eventCoordMap: Record<string, string[]> = {};
  const eventCoordDetails: Record<string, Array<{ name: string; phone: string; email: string }>> = {};

  if (authData?.users) {
    authData.users.forEach(u => {
      if (u.app_metadata?.role === 'coordinator') {
        const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
          ? u.app_metadata.coordinating_event_ids
          : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];
        ids.forEach(id => {
          if (!eventCoordMap[id]) eventCoordMap[id] = [];
          if (!eventCoordDetails[id]) eventCoordDetails[id] = [];
          const name = u.user_metadata?.full_name || u.email || 'Coordinator';
          const phone = u.user_metadata?.mobile || u.user_metadata?.phone || u.phone || '';
          const email = u.email || '';
          eventCoordMap[id].push(name);
          eventCoordDetails[id].push({ name, phone, email });
        });
      }
    });
  }

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

  // Server-side Rule Validation: Check coordinator count for this event
  const { data: authData } = await getAllAuthUsers(adminClient);
  const assignedCoords = (authData?.users || []).filter(u => {
    if (u.app_metadata?.role !== 'coordinator' && u.app_metadata?.role !== 'admin') return false;
    const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
      ? u.app_metadata.coordinating_event_ids
      : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];
    return ids.includes(subEventId);
  });

  // If no coordinator is assigned yet, assign the approving user so the event has a coordinator & appears live
  if (assignedCoords.length === 0 && user) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const existingIds: string[] = Array.isArray(user.app_metadata?.coordinating_event_ids)
      ? user.app_metadata.coordinating_event_ids
      : user.app_metadata?.coordinating_event_id ? [user.app_metadata.coordinating_event_id] : [];
    if (!existingIds.includes(subEventId)) {
      await updateCoordinatorAssignments(user.id, [...existingIds, subEventId]);
    }
  }

  const { error } = await adminClient
    .from('sub_events')
    .update({
      status: 'LIVE',
      approved_by: user?.id || null,
      approved_at: new Date().toISOString()
    })
    .eq('id', subEventId);

  revalidatePath('/admin');
  revalidatePath('/admin/sub-events');
  revalidatePath('/admin/coordinators');
  revalidatePath('/coordinator/events');
  revalidatePath('/events');
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
  const { data: authData } = await getAllAuthUsers(adminClient);
  const coordinatorDetails: Array<{ id: string; name: string; phone: string; email: string }> = [];

  if (authData?.users) {
    authData.users.forEach(u => {
      if (u.app_metadata?.role === 'coordinator') {
        const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
          ? u.app_metadata.coordinating_event_ids
          : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];
        if (ids.includes(subEventId)) {
          coordinatorDetails.push({
            id: u.id,
            name: u.user_metadata?.full_name || u.email || 'Coordinator',
            phone: u.user_metadata?.mobile || u.user_metadata?.phone || u.phone || '',
            email: u.email || ''
          });
        }
      }
    });
  }

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
  
  // 1.5 Validate all Team Member Emails
  const adminClient = getAdminClient();
  const validMemberParticipants: Record<string, any[]> = {}; // Map event_id to valid participants

  if (teamMembers && Object.keys(teamMembers).length > 0) {
    for (const [subEventId, membersEmailsStr] of Object.entries(teamMembers)) {
      const emails = membersEmailsStr.split(',').map(e => e.trim()).filter(e => e);
      const validParts = [];
      for (const email of emails) {
        // Find participant by email
        const { data: memberPart } = await adminClient
          .from('participants')
          .select('*')
          .eq('email', email)
          .single();

        if (!memberPart) {
          return { success: false, error: `Team member with email ${email} not found. Please ensure they have registered an account.` };
        }
        validParts.push(memberPart);
      }
      validMemberParticipants[subEventId] = validParts;
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

    const { error: subError } = await adminClient.from('registration_sub_events').insert(subEventsData);
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

  const { data: authData } = await getAllAuthUsers(adminClient);
  const roleMap = new Map<string, string>();
  const genderMap = new Map<string, string>();
  if (authData?.users) {
    authData.users.forEach(u => {
      const role = u.app_metadata?.role || 'student';
      roleMap.set(u.id, role);
      
      const gender = u.user_metadata?.gender || '';
      genderMap.set(u.id, gender);
      
      if (u.email) {
        roleMap.set(u.email.toLowerCase(), role);
        genderMap.set(u.email.toLowerCase(), gender);
      }
    });
  }

  const { data, error } = await adminClient
    .from('participants')
    .select(`
      *,
      registrations (
        id,
        fest_id,
        created_at,
        registration_sub_events (
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

  if (error) {
    console.error("Error fetching admin participants with relations:", error);
    // Fallback: fetch participants directly if join encounters issues
    const { data: rawData, error: rawError } = await adminClient
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (rawError) {
      console.error("Error fetching raw participants:", rawError);
      return [];
    }
    return (rawData || []).map(p => ({
      ...p,
      role: roleMap.get(p.participant_id) || (p.email ? roleMap.get(p.email.toLowerCase()) : null) || 'student',
      gender: genderMap.get(p.participant_id) || (p.email ? genderMap.get(p.email.toLowerCase()) : null) || ''
    }));
  }

  return (data || []).map(p => ({
    ...p,
    role: roleMap.get(p.participant_id) || (p.email ? roleMap.get(p.email.toLowerCase()) : null) || 'student',
    gender: genderMap.get(p.participant_id) || (p.email ? genderMap.get(p.email.toLowerCase()) : null) || ''
  }));
}

export async function getCoordinatorParticipants() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const assignedEventId = user.app_metadata?.coordinating_event_id;
  const adminClient = getAdminClient();

  if (!assignedEventId) {
     // Fallback: Return admin participants but ONLY those who registered for events
     const allParticipants = await getAdminParticipants();
     return allParticipants.filter((p: any) => {
       if (!p.registrations || !Array.isArray(p.registrations)) return false;
       return p.registrations.some((reg: any) => reg.registration_sub_events && reg.registration_sub_events.length > 0);
     });
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
    .eq('sub_event_id', assignedEventId);

  if (error || !data) {
    console.error("Error fetching coordinator participants:", error);
    return [];
  }

  // Fetch attendance for this event
  const { data: attendanceData } = await adminClient
    .from('attendance')
    .select('participant_id')
    .eq('event_id', assignedEventId)
    .eq('status', 'Present');
    
  const presentParticipantIds = new Set(
    (attendanceData || []).map(a => a.participant_id)
  );

  const participantsMap = new Map<string, any>();
  data.forEach((row: any) => {
    const p = row.registrations?.participants;
    if (p && p.participant_id && !participantsMap.has(p.participant_id)) {
       // We normalize the ID field so it matches what the frontend expects
       p.id = p.participant_id;
       p.isPresent = presentParticipantIds.has(p.participant_id);
       participantsMap.set(p.participant_id, p);
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

  const { data: authData } = await getAllAuthUsers(adminClient);
  const eventCoordMap: Record<string, string[]> = {};

  if (authData?.users) {
    authData.users.forEach(u => {
      const ids: string[] = Array.isArray(u.app_metadata?.coordinating_event_ids)
        ? u.app_metadata.coordinating_event_ids
        : u.app_metadata?.coordinating_event_id ? [u.app_metadata.coordinating_event_id] : [];

      const name = u.user_metadata?.full_name || u.email || 'Coordinator';

      ids.forEach(id => {
        if (!eventCoordMap[id]) eventCoordMap[id] = [];
        if (!eventCoordMap[id].includes(name)) {
          eventCoordMap[id].push(name);
        }
      });
    });
  }

  const enrichedSubEvents = (subEvents || []).map(event => {
    const names = eventCoordMap[event.id] || [];
    return {
      ...event,
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
