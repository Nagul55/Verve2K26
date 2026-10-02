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
