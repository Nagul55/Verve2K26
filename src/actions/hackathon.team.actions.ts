"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function getUserHackathonTeam(hackathonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = getAdminClient();
  
  // First get the team the user is in
  const { data: teamMemberships } = await adminClient.from('hackathon_team_members')
    .select('team_id, hackathon_teams(*)')
    .eq('participant_id', user.id);

  if (!teamMemberships || teamMemberships.length === 0) return null;

  for (const record of teamMemberships as any[]) {
    const rawTeam = record.hackathon_teams;
    const team = Array.isArray(rawTeam) ? rawTeam[0] : rawTeam;

    if (team && team.hackathon_id === hackathonId) {
      // Fetch all accepted members of this team
      const { data: members } = await adminClient.from('hackathon_team_members')
        .select('participant_id, joined_at, participants(participant_id, full_name, email)')
        .eq('team_id', team.id);

      // Fetch pending invitations from team_members
      const { data: pendingMembers } = await adminClient.from('team_members')
        .select('participant_id, joined_at, status, participants(participant_id, full_name, email)')
        .eq('team_id', team.id)
        .eq('status', 'Pending');

      return {
        ...team,
        members: members || [],
        pendingInvitations: pendingMembers || []
      };
    }
  }

  return null;
}

export async function createHackathonTeam(hackathonId: string, festId: string, teamName: string, passcode: string, problemStatementId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to create a team." };
  }

  const adminClient = getAdminClient();

  // Check if team name already exists for this hackathon
  const { data: existingTeam } = await adminClient.from('hackathon_teams')
    .select('id')
    .eq('hackathon_id', hackathonId)
    .eq('name', teamName)
    .single();

  if (existingTeam) {
    return { success: false, error: "A team with this name already exists in this hackathon." };
  }

  // Check if user is already in a team for this hackathon
  const { data: userTeams } = await adminClient.from('hackathon_teams')
    .select(`id, hackathon_team_members!inner(participant_id)`)
    .eq('hackathon_id', hackathonId)
    .eq('hackathon_team_members.participant_id', user.id);

  if (userTeams && userTeams.length > 0) {
    return { success: false, error: "You are already a member of a team for this hackathon." };
  }

  // Create Team in hackathon_teams
  const { data: newTeam, error: teamError } = await adminClient.from('hackathon_teams').insert({
    hackathon_id: hackathonId,
    name: teamName,
    passcode: passcode,
    problem_statement_id: problemStatementId || null,
    leader_id: user.id
  }).select('id').single();

  if (teamError) {
    return { success: false, error: teamError.message };
  }

  // Add leader to hackathon_team_members
  const { error: memberError } = await adminClient.from('hackathon_team_members').insert({
    team_id: newTeam.id,
    participant_id: user.id
  });

  if (memberError) {
    return { success: false, error: memberError.message };
  }

  // Sync to teams and team_members for unified invitation support
  try {
    const { data: subEvent } = await adminClient.from('sub_events').select('id').eq('fest_id', festId).maybeSingle();
    if (subEvent) {
      await adminClient.from('teams').upsert({
        team_id: newTeam.id,
        event_id: subEvent.id,
        team_name: teamName,
        leader_participant_id: user.id,
        status: 'Approved'
      }, { onConflict: 'team_id' });

      await adminClient.from('team_members').upsert({
        team_id: newTeam.id,
        participant_id: user.id,
        status: 'Accepted',
        membership_status: 'Active'
      }, { onConflict: 'team_id,participant_id' });
    }
  } catch (e) {
    console.warn("Could not sync hackathon team to events teams table:", e);
  }

  revalidatePath(`/hackathons/${festId}`);
  return { success: true, teamId: newTeam.id };
}

export async function joinHackathonTeam(hackathonId: string, festId: string, teamName: string, passcode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to join a team." };
  }

  const adminClient = getAdminClient();

  // Find team
  const { data: team } = await adminClient.from('hackathon_teams')
    .select('id, passcode, hackathon_id')
    .eq('hackathon_id', hackathonId)
    .eq('name', teamName)
    .single();

  if (!team) {
    return { success: false, error: "Team not found." };
  }

  if (team.passcode !== passcode) {
    return { success: false, error: "Invalid passcode." };
  }

  // Check if already in a team
  const { data: userTeams } = await adminClient.from('hackathon_teams')
    .select(`id, hackathon_team_members!inner(participant_id)`)
    .eq('hackathon_id', hackathonId)
    .eq('hackathon_team_members.participant_id', user.id);

  if (userTeams && userTeams.length > 0) {
    return { success: false, error: "You are already a member of a team for this hackathon." };
  }

  // Enforce Max Team Size
  const { data: hackathon } = await adminClient.from('hackathons').select('maximum_team_size').eq('id', hackathonId).single();
  const maxTeamSize = hackathon?.maximum_team_size || 4;

  const { count } = await adminClient.from('hackathon_team_members')
    .select('id', { count: 'exact' })
    .eq('team_id', team.id);

  if (count && count >= maxTeamSize) {
    return { success: false, error: `This team has already reached the maximum size of ${maxTeamSize} members.` };
  }

  // Add member
  const { error: memberError } = await adminClient.from('hackathon_team_members').insert({
    team_id: team.id,
    participant_id: user.id
  });

  if (memberError) {
    return { success: false, error: memberError.message };
  }

  // Also sync member to team_members table
  try {
    await adminClient.from('team_members').upsert({
      team_id: team.id,
      participant_id: user.id,
      status: 'Accepted',
      membership_status: 'Active'
    }, { onConflict: 'team_id,participant_id' });
  } catch (e) {
    console.warn("Could not sync member to team_members table:", e);
  }

  revalidatePath(`/hackathons/${festId}`);
  return { success: true, teamId: team.id };
}

export async function sendHackathonInvitation(teamId: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to send invitations." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const adminClient = getAdminClient();

  // 1. Fetch team details
  const { data: team, error: teamErr } = await adminClient
    .from('hackathon_teams')
    .select('*, hackathons(*)')
    .eq('id', teamId)
    .single();

  if (teamErr || !team) {
    return { success: false, error: "Team not found." };
  }

  // 2. Any member of the team (or leader) can send invitations
  const isLeader = team.leader_id === user.id;
  const { data: memberRecord } = await adminClient
    .from('hackathon_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('participant_id', user.id)
    .maybeSingle();

  if (!isLeader && !memberRecord) {
    return { success: false, error: "Only members of this team can send team invitations." };
  }

  // 3. Find target student by email
  const { data: targetStudent, error: studentErr } = await adminClient
    .from('participants')
    .select('participant_id, full_name, email')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (studentErr || !targetStudent) {
    return { 
      success: false, 
      error: `No registered student found with email "${cleanEmail}". Make sure they have created an account on Eventrix.` 
    };
  }

  // 4. Cannot invite self
  if (targetStudent.participant_id === user.id) {
    return { success: false, error: "You cannot invite yourself to the team." };
  }

  // 5. Check if student is already in this team
  const { data: existingMember } = await adminClient
    .from('hackathon_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('participant_id', targetStudent.participant_id)
    .maybeSingle();

  if (existingMember) {
    return { success: false, error: `${targetStudent.full_name || cleanEmail} is already a member of this team.` };
  }

  // 6. Check if student is already in ANY team for this hackathon
  const { data: anyTeam } = await adminClient
    .from('hackathon_teams')
    .select(`id, name, hackathon_team_members!inner(participant_id)`)
    .eq('hackathon_id', team.hackathon_id)
    .eq('hackathon_team_members.participant_id', targetStudent.participant_id);

  if (anyTeam && anyTeam.length > 0) {
    return { 
      success: false, 
      error: `${targetStudent.full_name || cleanEmail} is already registered in another team ("${anyTeam[0].name}") for this hackathon.` 
    };
  }

  // 7. Check max team size capacity (members + pending invites)
  const maxTeamSize = team.hackathons?.maximum_team_size || 4;

  const { count: currentMembersCount } = await adminClient
    .from('hackathon_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', teamId);

  const { count: pendingInvitesCount } = await adminClient
    .from('team_members')
    .select('team_member_id', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .eq('status', 'Pending');

  const totalOccupied = (currentMembersCount || 0) + (pendingInvitesCount || 0);

  if (totalOccupied >= maxTeamSize) {
    return { 
      success: false, 
      error: `Cannot invite more members. Maximum team capacity of ${maxTeamSize} reached (including pending invitations).` 
    };
  }

  // 8. Check if invitation is already pending for this student
  const { data: existingInvite } = await adminClient
    .from('team_members')
    .select('team_member_id')
    .eq('team_id', teamId)
    .eq('participant_id', targetStudent.participant_id)
    .eq('status', 'Pending')
    .maybeSingle();

  if (existingInvite) {
    return { success: false, error: `An invitation has already been sent to ${targetStudent.full_name || cleanEmail} and is pending acceptance.` };
  }

  // 9. Ensure `teams` record exists
  const festId = team.hackathons?.event_id;
  const { data: subEvent } = await adminClient
    .from('sub_events')
    .select('id')
    .eq('fest_id', festId)
    .maybeSingle();

  if (subEvent) {
    await adminClient.from('teams').upsert({
      team_id: team.id,
      event_id: subEvent.id,
      team_name: team.name,
      leader_participant_id: team.leader_id,
      status: 'Approved'
    }, { onConflict: 'team_id' });
  }

  // 10. Insert invitation into `team_members`
  const { error: inviteError } = await adminClient.from('team_members').insert({
    team_id: team.id,
    participant_id: targetStudent.participant_id,
    status: 'Pending',
    membership_status: 'Invited'
  });

  if (inviteError) {
    return { success: false, error: inviteError.message || "Failed to send invitation." };
  }

  revalidatePath('/invitations');
  if (festId) {
    revalidatePath(`/hackathons/${festId}`);
  }

  return { 
    success: true, 
    message: `Invitation successfully sent to ${targetStudent.full_name || cleanEmail}! They can accept it in their Invitations section.` 
  };
}

export async function cancelHackathonInvitation(teamId: string, participantId: string, festId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const adminClient = getAdminClient();

  const { data: team } = await adminClient.from('hackathon_teams').select('leader_id').eq('id', teamId).single();
  const isLeader = team?.leader_id === user.id;
  const { data: memberRecord } = await adminClient
    .from('hackathon_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('participant_id', user.id)
    .maybeSingle();

  if (!isLeader && !memberRecord) {
    return { success: false, error: "Only members of this team can cancel invitations." };
  }

  const { error } = await adminClient
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('participant_id', participantId)
    .eq('status', 'Pending');

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/invitations');
  if (festId) {
    revalidatePath(`/hackathons/${festId}`);
  }

  return { success: true };
}

