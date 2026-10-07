"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
  const { data: teamData } = await adminClient.from('hackathon_team_members')
    .select('team_id, hackathon_teams(*)')
    .eq('participant_id', user.id)
    .single();

  if (teamData && teamData.hackathon_teams && teamData.hackathon_teams.hackathon_id === hackathonId) {
    const team = teamData.hackathon_teams;
    
    // Fetch all members of this team
    const { data: members } = await adminClient.from('hackathon_team_members')
      .select('participant_id, joined_at, participants(full_name, email)')
      .eq('team_id', team.id);

    return {
      ...team,
      members: members || []
    };
  }
  return null;
}

import { revalidatePath } from "next/cache";

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

  // Create Team
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

  // Add leader to team members
  const { error: memberError } = await adminClient.from('hackathon_team_members').insert({
    team_id: newTeam.id,
    participant_id: user.id
  });

  if (memberError) {
    return { success: false, error: memberError.message };
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

  revalidatePath(`/hackathons/${festId}`);
  return { success: true, teamId: team.id };
}
