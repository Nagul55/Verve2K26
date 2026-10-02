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

export async function createFest(name: string, description: string, minTech: number, minNonTech: number) {
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
export async function getSubEvents(festId?: string) {
  const adminClient = getAdminClient();
  let query = adminClient.from('sub_events').select('*');
  if (festId) query = query.eq('fest_id', festId);
  
  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function createSubEvent(subEventData: any) {
  const adminClient = getAdminClient();
  const { error } = await adminClient.from('sub_events').insert(subEventData);
  return { success: !error, error: error?.message };
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

        if (!teamError && newTeam) {
          // Add leader to team
          await adminClient
            .from('team_members')
            .insert({
              team_id: newTeam.team_id,
              participant_id: participant.participant_id,
              membership_status: 'Active'
            });

          // Process extra team members
          const validParts = validMemberParticipants[subEventId] || [];

          for (const memberPart of validParts) {
            // 1. Add them to the team
            await adminClient.from('team_members').insert({
              team_id: newTeam.team_id,
              participant_id: memberPart.participant_id,
              membership_status: 'Active'
            });

              // 2. Ensure they are registered for the Fest
              let memberFestRegId;
              const { data: existingReg } = await adminClient
                .from('registrations')
                .select('id')
                .eq('participant_id', memberPart.participant_id)
                .eq('fest_id', festId)
                .single();

              if (existingReg) {
                memberFestRegId = existingReg.id;
              } else {
                const { data: newReg } = await adminClient
                  .from('registrations')
                  .insert({
                    participant_id: memberPart.participant_id,
                    fest_id: festId
                  })
                  .select('id')
                  .single();
                if (newReg) memberFestRegId = newReg.id;
              }

              // 3. Register them for the Sub-Event to generate their ticket
              if (memberFestRegId) {
                // Ignore if already registered for this sub-event
                const { data: existingSub } = await adminClient
                  .from('registration_sub_events')
                  .select('id')
                  .eq('registration_id', memberFestRegId)
                  .eq('sub_event_id', subEventId)
                  .single();

                if (!existingSub) {
                  await adminClient.from('registration_sub_events').insert({
                    registration_id: memberFestRegId,
                    sub_event_id: subEventId
                  });

                  // 4. Send them a ticket email for this event!
                  const { data: eventData } = await adminClient.from('sub_events').select('*').eq('id', subEventId).single();
                  if (eventData) {
                    await sendTicketEmail(memberPart.email, memberPart.full_name, [eventData]);
                  }
                }
              }
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

  // Query registrations for this participant, join with registration_sub_events, and then sub_events
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
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
    `)
    .eq('participant_id', user.id);

  if (error || !data) return [];

  // Flatten the result
  const registeredEvents: any[] = [];
  data.forEach((reg: any) => {
    reg.registration_sub_events.forEach((rse: any) => {
      if (rse.sub_events) {
        registeredEvents.push({
          ...rse.sub_events,
          ticketNumber: `TKT-${reg.id.split('-')[0].toUpperCase()}-${rse.sub_events.id.split('-')[0].toUpperCase()}`
        });
      }
    });
  });

  return registeredEvents;
}
