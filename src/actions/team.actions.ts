"use server";

import { createClient } from '@/lib/supabase/server';

export async function createTeam(teamName: string, eventId: string, leaderEmail: string) {
  const supabase = await createClient();

  // 1. Find participant by email
  const { data: participant, error: partError } = await supabase
    .from('participants')
    .select('participant_id')
    .eq('email', leaderEmail)
    .single();

  if (partError || !participant) {
    return { success: false, error: "Participant not found. Have you registered for the event first?" };
  }

  // 2. Verify participant is actually registered for this event
  const { data: registration } = await supabase
    .from('registrations')
    .select(`
      id,
      registration_sub_events!inner (
        sub_event_id
      )
    `)
    .eq('participant_id', participant.participant_id)
    .eq('registration_sub_events.sub_event_id', eventId)
    .single();

  if (!registration) {
    return { success: false, error: "You must register for this individual event before creating a team for it." };
  }

  // 3. Check if team name exists for this event
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('team_id')
    .eq('event_id', eventId)
    .eq('team_name', teamName)
    .single();

  if (existingTeam) {
    return { success: false, error: "Team name already taken for this event." };
  }

  // 4. Check if user is already in a team for this event
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('participant_id', participant.participant_id)
    .single(); // Note: in a real app, join with teams to check if it's the SAME event. We'll simplify for now.

  // 5. Create Team
  const { data: newTeam, error: teamError } = await supabase
    .from('teams')
    .insert({
      team_name: teamName,
      event_id: eventId,
      leader_participant_id: participant.participant_id,
      status: 'Approved' // auto approve for now
    })
    .select('team_id')
    .single();

  if (teamError || !newTeam) {
    return { success: false, error: teamError?.message || "Failed to create team." };
  }

  // 6. Add leader to team_members
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: newTeam.team_id,
      participant_id: participant.participant_id,
      membership_status: 'Active'
    });

  if (memberError) {
    return { success: false, error: "Team created, but failed to add leader as member." };
  }

  return { success: true };
}

// ---------------------------------------------
// TEAM INVITATION & MANAGEMENT
// ---------------------------------------------

export async function getPendingInvitations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: teamMembers, error } = await adminClient
    .from('team_members')
    .select('team_id, status, teams(team_name, event_id, leader_participant_id)')
    .eq('participant_id', user.id)
    .eq('status', 'Pending');

  if (error) {
    console.error('getPendingInvitations error:', error);
    return [];
  }
  if (!teamMembers || teamMembers.length === 0) return [];

  const eventIds = (teamMembers || []).map((tm: any) => tm.teams?.event_id).filter(Boolean);
  
  const { data: subEvents, error: subErr } = await adminClient
    .from('sub_events')
    .select('id, title, fest_id')
    .in('id', eventIds);

  if (subErr) {
    console.error('subEvents fetch error:', subErr);
  }

  const subEventsMap = new Map((subEvents || []).map(se => [se.id, se]));

  return (teamMembers || []).map((tm: any) => {
    const eventId = tm.teams?.event_id;
    const subEvent = subEventsMap.get(eventId);
    return {
      ...tm,
      teams: {
        ...(tm.teams || {}),
        sub_events: subEvent || null
      }
    };
  });
}

export async function acceptTeamInvitation(teamId: string, eventId: string, festId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // 1. Update status to Accepted
  
  // Admin client needed for registering and email
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await adminClient
    .from('team_members')
    .update({ status: 'Accepted' })
    .eq('team_id', teamId)
    .eq('participant_id', user.id);

  if (updateError) return { success: false, error: updateError.message };

  // 2. Ensure registered for Fest
  let memberFestRegId;
  const { data: existingReg } = await adminClient
    .from('registrations')
    .select('id')
    .eq('participant_id', user.id)
    .eq('fest_id', festId)
    .single();

  if (existingReg) {
    memberFestRegId = existingReg.id;
  } else {
    const { data: newReg } = await adminClient
      .from('registrations')
      .insert({ participant_id: user.id, fest_id: festId })
      .select('id')
      .single();
    if (newReg) memberFestRegId = newReg.id;
  }

  // 3. Register for Sub-Event
  if (memberFestRegId) {
    const { data: existingSub } = await adminClient
      .from('registration_sub_events')
      .select('id')
      .eq('registration_id', memberFestRegId)
      .eq('sub_event_id', eventId)
      .single();

    if (!existingSub) {
      await adminClient.from('registration_sub_events').insert({
        registration_id: memberFestRegId,
        sub_event_id: eventId
      });
      
      // 4. Send Ticket Email
      const { sendTicketEmail } = await import('./email.actions');
      const { data: memberPart } = await adminClient.from('participants').select('*').eq('participant_id', user.id).single();
      const { data: eventData } = await adminClient.from('sub_events').select('*').eq('id', eventId).single();
      
      if (memberPart && eventData) {
        await sendTicketEmail(memberPart.email, memberPart.full_name, [eventData]);
      }
    }
  }

  return { success: true };
}

export async function rejectTeamInvitation(teamId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  
  // Admin client needed for registering and email
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('participant_id', user.id)
    .eq('status', 'Pending'); // Only allow deleting if still pending

  return { success: !error, error: error?.message };
}

import { revalidatePath } from 'next/cache';

export async function removeTeamMember(teamId: string, memberParticipantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch team, sub_event, and fest
  const { data: team, error: teamErr } = await adminClient
    .from('teams')
    .select('*, sub_events(*, fests(*))')
    .eq('team_id', teamId)
    .single();
  
  if (teamErr || !team) return { success: false, error: "Team not found." };
  if (team.leader_participant_id !== user.id) {
    return { success: false, error: "Only the team leader can remove members" };
  }

  const subEvent = team.sub_events;
  const fest = subEvent?.fests;

  // 2. Check Fest Registration Deadline
  if (fest?.registration_closes_at && new Date() >= new Date(fest.registration_closes_at)) {
    return { success: false, error: "Team changes are closed because fest registration has ended." };
  }

  // 3. Count remaining members
  const { data: currentMembers } = await adminClient
    .from('team_members')
    .select('participant_id')
    .eq('team_id', teamId);

  const currentCount = currentMembers?.length || 0;
  const minCandidates = subEvent?.min_candidates || 2;

  if (currentCount - 1 < minCandidates) {
    return { 
      success: false, 
      error: `Cannot remove member: Team must have at least ${minCandidates} members.` 
    };
  }

  const { error } = await adminClient
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('participant_id', memberParticipantId);

  revalidatePath('/registrations');
  revalidatePath('/dashboard');
  return { success: !error, error: error?.message };
}

export async function updateRegisteredTeam(
  teamId: string,
  newMemberEmails: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch team, sub_event, and fest
  const { data: team, error: teamErr } = await adminClient
    .from('teams')
    .select('*, sub_events(*, fests(*))')
    .eq('team_id', teamId)
    .single();

  if (teamErr || !team) return { success: false, error: "Team not found." };
  if (team.leader_participant_id !== user.id) {
    return { success: false, error: "Only the team leader can modify the team." };
  }

  const subEvent = team.sub_events;
  const fest = subEvent?.fests;

  // 2. Check Fest Registration Deadline
  if (fest?.registration_closes_at && new Date() >= new Date(fest.registration_closes_at)) {
    return { success: false, error: "Team changes are closed because fest registration has ended." };
  }

  // 3. Validate Proposed Final Team Size
  const cleanEmails = Array.from(new Set(newMemberEmails.map(e => e.trim().toLowerCase()).filter(Boolean)));
  const minCandidates = subEvent?.min_candidates || 2;
  const maxCandidates = subEvent?.max_candidates || 5;

  const finalTeamSize = 1 + cleanEmails.length; // Leader + members

  if (finalTeamSize < minCandidates) {
    return { success: false, error: `Team must have at least ${minCandidates} members.` };
  }
  if (finalTeamSize > maxCandidates) {
    return { success: false, error: `Maximum team size is ${maxCandidates} members.` };
  }

  // Ensure leader email is not included in extra member emails
  const { data: leaderPart } = await adminClient
    .from('participants')
    .select('email')
    .eq('participant_id', user.id)
    .single();

  const leaderEmail = leaderPart?.email?.toLowerCase();
  if (leaderEmail && cleanEmails.includes(leaderEmail)) {
    return { success: false, error: "Team Leader is automatically included. Do not add leader email as a member." };
  }

  // 4. Validate Member Existence
  let memberParticipants: any[] = [];
  if (cleanEmails.length > 0) {
    const { data: parts } = await adminClient
      .from('participants')
      .select('*')
      .in('email', cleanEmails);

    if (!parts || parts.length !== cleanEmails.length) {
      const foundEmails = new Set((parts || []).map(p => p.email.toLowerCase()));
      const missing = cleanEmails.filter(e => !foundEmails.has(e));
      return { success: false, error: `Member(s) not registered in system: ${missing.join(', ')}` };
    }
    memberParticipants = parts;
  }

  // 5. Atomic Update of Team Members
  const targetPartIds = new Set(memberParticipants.map(p => p.participant_id));
  targetPartIds.add(user.id); // Ensure Leader stays

  // Fetch current team members
  const { data: currentMembers } = await adminClient
    .from('team_members')
    .select('participant_id, status')
    .eq('team_id', teamId);

  const currentMap = new Map((currentMembers || []).map(m => [m.participant_id, m.status]));

  // Remove members who are no longer in cleanEmails
  for (const [partId] of currentMap.entries()) {
    if (partId !== user.id && !targetPartIds.has(partId)) {
      await adminClient.from('team_members').delete().eq('team_id', teamId).eq('participant_id', partId);
    }
  }

  // Add new member emails as Pending
  for (const p of memberParticipants) {
    if (!currentMap.has(p.participant_id)) {
      await adminClient.from('team_members').insert({
        team_id: teamId,
        participant_id: p.participant_id,
        status: 'Pending'
      });
    }
  }

  revalidatePath('/registrations');
  revalidatePath('/dashboard');
  return { success: true };
}


