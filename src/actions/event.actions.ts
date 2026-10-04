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
  if (!includePending) {
    query = query.eq('status', 'Approved');
  }
  
  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function createSubEvent(subEventData: any) {
  const adminClient = getAdminClient();
  
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
  if (subEventData.contact_info && subEventData.contact_info.trim() && !formattedDesc.includes('CONTACT:')) {
    formattedDesc += `\n\nCONTACT: ${subEventData.contact_info.trim()}`;
  }

  // Only pass columns that exist in the Supabase sub_events table schema
  const cleanPayload: any = {
    fest_id: subEventData.fest_id || '00000000-0000-0000-0000-000000000001',
    title: subEventData.title,
    description: formattedDesc,
    category: subEventData.category || 'Technical',
    participation_type: subEventData.participation_type || 'Individual',
    min_candidates: subEventData.min_candidates ? parseInt(subEventData.min_candidates) : 1,
    max_candidates: subEventData.max_candidates ? parseInt(subEventData.max_candidates) : 1,
    date: subEventData.date || 'TBD',
    time: subEventData.time || 'TBD',
    location: subEventData.location,
    capacity: typeof subEventData.capacity === 'number' ? subEventData.capacity : parseInt(subEventData.capacity || '100')
  };

  const { error } = await adminClient.from('sub_events').insert(cleanPayload);
  return { success: !error, error: error?.message };
}

export async function approveSubEvent(subEventId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from('sub_events')
    .update({ status: 'Approved' })
    .eq('id', subEventId);

  revalidatePath('/admin/sub-events');
  revalidatePath('/admin/coordinators');
  revalidatePath('/coordinator/events');
  revalidatePath('/events');
  return { success: !error, error: error?.message };
}

export async function approveAndPermitSubEvent(subEventId: string, coordinatorId?: string) {
  const adminClient = getAdminClient();
  
  // 1. Update sub_event status to Approved
  const { error } = await adminClient
    .from('sub_events')
    .update({ status: 'Approved' })
    .eq('id', subEventId);

  if (error) return { success: false, error: error.message };

  // 2. If coordinatorId is specified, grant permission to that coordinator
  if (coordinatorId && coordinatorId.trim() !== '') {
    const { error: userError } = await adminClient.auth.admin.updateUserById(coordinatorId, {
      app_metadata: { role: 'coordinator', coordinating_event_id: subEventId }
    });
    if (userError) return { success: false, error: userError.message };
  }

  revalidatePath('/admin/coordinators');
  revalidatePath('/admin/sub-events');
  revalidatePath('/coordinator/events');
  revalidatePath('/events');
  return { success: true };
}

export async function deleteSubEvent(subEventId: string) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.from('sub_events').delete().eq('id', subEventId);
  return { success: !error, error: error?.message };
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
    return rawData || [];
  }

  return data || [];
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
