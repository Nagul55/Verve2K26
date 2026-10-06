import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getCoordinatorAssignedEventIds } from '@/actions/event.actions';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pid = body.pid || body.participant_id || body.participantId;
    const qrEventId = body.event_id || body.sub_event_id || body.eventId || body.subEventId;
    const registrationIdInput = body.registration_id || body.registrationId || body.ticketId || body.ticket_id;
    const rawCode = body.rawCode || body.code;

    // --- STRICT RBAC SECURITY CHECK ---
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access. Please log in.' }, { status: 401 });
    }
    
    // Fetch live user assignment data directly from Supabase Auth admin to bypass any stale JWT or cached state
    const { assignedEventIds: coordinatorAssignedIds, role: userRole } = await getCoordinatorAssignedEventIds(user.id);
    const isAdmin = userRole === 'admin' || userRole === 'Super Admin' || user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'Super Admin';
    const isCoordinator = !isAdmin && (userRole === 'coordinator' || user.app_metadata?.role === 'coordinator');

    if (!isAdmin && !isCoordinator) {
      return NextResponse.json({ error: 'Access Denied: You do not have scanner privileges.' }, { status: 403 });
    }

    if (isCoordinator && coordinatorAssignedIds.length === 0) {
      return NextResponse.json({ error: 'Access Denied: You have no assigned events to coordinate.' }, { status: 403 });
    }

    // 1. Resolve Target Participant Profile
    let targetParticipantId: string | null = pid || null;
    let participantProfile: any = null;

    if (targetParticipantId) {
      const { data: partData } = await supabaseAdmin
        .from('participants')
        .select('*')
        .eq('participant_id', targetParticipantId)
        .maybeSingle();
      
      if (partData) {
        participantProfile = partData;
      }
    }

    // Fallback: If not found by participant_id, try searching register_number or raw code or email
    if (!participantProfile && (pid || rawCode)) {
      const searchValue = pid || rawCode;
      const { data: partData } = await supabaseAdmin
        .from('participants')
        .select('*')
        .or(`register_number.eq.${searchValue},email.eq.${searchValue}`)
        .maybeSingle();
      
      if (partData) {
        participantProfile = partData;
        targetParticipantId = partData.participant_id;
      }
    }

    // Fallback: If not found yet, but registrationId was passed, lookup via registrations table
    if (!participantProfile && registrationIdInput) {
      const { data: regData } = await supabaseAdmin
        .from('registrations')
        .select('*, participants(*)')
        .eq('id', registrationIdInput)
        .maybeSingle();
      
      if (regData && regData.participants) {
        participantProfile = regData.participants;
        targetParticipantId = regData.participant_id;
      }
    }

    if (!targetParticipantId || !participantProfile) {
      return NextResponse.json({ error: 'Invalid ticket — Participant or registration record not found.' }, { status: 404 });
    }

    // 2. Fetch registrations for this participant
    const { data: userRegistrations, error: regLookupError } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('participant_id', targetParticipantId);

    if (regLookupError || !userRegistrations || userRegistrations.length === 0) {
      return NextResponse.json({ error: 'Access Denied: Participant is not registered for any events.' }, { status: 404 });
    }

    const regIds = userRegistrations.map((r: any) => r.id);

    // 3. Fetch all registered sub-events (SINGLE SOURCE OF TRUTH)
    const { data: regSubEvents, error: regError } = await supabaseAdmin
      .from('registration_sub_events')
      .select(`
        sub_event_id,
        registration_id,
        sub_events (
          id,
          title,
          category,
          date,
          time,
          location
        )
      `)
      .in('registration_id', regIds);

    if (regError || !regSubEvents || regSubEvents.length === 0) {
      return NextResponse.json({ error: 'Access Denied: No specific sub-events found for this participant.' }, { status: 404 });
    }

    // 4. Resolve Target Sub-Event & Registration Item
    let selectedRegItem: any = null;

    if (qrEventId) {
      // Event ID explicitly specified in QR payload
      const matched = regSubEvents.find((rse: any) => rse.sub_event_id === qrEventId);
      if (!matched) {
        return NextResponse.json({ error: 'Access Denied: Student is not registered for this specific event.' }, { status: 404 });
      }

      if (isCoordinator && !coordinatorAssignedIds.includes(qrEventId)) {
        return NextResponse.json({ error: 'Not authorized for this event.' }, { status: 403 });
      }

      selectedRegItem = matched;
    } else {
      // Event ID NOT specified in QR code -> Resolve through coordinator permissions and attendance state
      let allowedMatches = regSubEvents;
      if (isCoordinator) {
        allowedMatches = regSubEvents.filter((rse: any) => coordinatorAssignedIds.includes(rse.sub_event_id));
        if (allowedMatches.length === 0) {
          return NextResponse.json({ error: 'Participant is not registered for any event assigned to you.' }, { status: 403 });
        }
      }

      if (allowedMatches.length === 1) {
        selectedRegItem = allowedMatches[0];
      } else {
        // Participant registered for multiple allowed sub-events -> Pick the one NOT YET attended (Pending)
        const subEventIds = allowedMatches.map((r: any) => r.sub_event_id);
        const { data: existingAttList } = await supabaseAdmin
          .from('attendance')
          .select('event_id')
          .eq('participant_id', targetParticipantId)
          .in('event_id', subEventIds);

        const attendedEventIds = new Set((existingAttList || []).map(a => a.event_id));
        const pendingMatch = allowedMatches.find((rse: any) => !attendedEventIds.has(rse.sub_event_id));

        selectedRegItem = pendingMatch || allowedMatches[0];
      }
    }

    const targetSubEvent = (selectedRegItem as any).sub_events;
    const targetSubEventId = selectedRegItem.sub_event_id;
    const targetRegistrationId = selectedRegItem.registration_id;

    // 4.8 Check Team Ticket Completeness & Validity if this is a Team Event
    if (targetSubEvent.participation_type === 'Team') {
      const { data: userTeamMember } = await supabaseAdmin
        .from('team_members')
        .select('team_id, status, teams!inner(team_id, event_id, min_candidates, team_members(participant_id, status))')
        .eq('participant_id', targetParticipantId)
        .eq('teams.event_id', targetSubEventId)
        .maybeSingle();

      if (!userTeamMember || userTeamMember.status !== 'Accepted') {
        return NextResponse.json({ 
          error: 'Ticket is no longer valid. The team membership was updated or team acceptance is pending.' 
        }, { status: 400 });
      }

      const teamData: any = userTeamMember.teams;
      const allMembers = teamData?.team_members || [];
      const hasPending = allMembers.some((m: any) => m.status === 'Pending');
      const minCount = teamData?.min_candidates || 2;

      if (hasPending || allMembers.length < minCount) {
        return NextResponse.json({ 
          error: 'Ticket is not valid. Waiting for all team members to accept their team invitations.' 
        }, { status: 400 });
      }
    }

    // 5. Check Check-In Status (Prevent Duplicate Scans for THIS event)
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendance')
      .select('attendance_id, created_at, scanned_at')
      .eq('participant_id', targetParticipantId)
      .eq('event_id', targetSubEventId)
      .maybeSingle();

    if (existingAttendance) {
      const timeVal = existingAttendance.scanned_at || existingAttendance.created_at;
      const scanTime = timeVal
        ? new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      return NextResponse.json({ 
        error: `Ticket already checked in! Participant was scanned at ${scanTime || 'an earlier time'} for ${targetSubEvent.title}.` 
      }, { status: 400 });
    }

    // 6. Record Attendance Atomically
    const { error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .insert([{
        participant_id: targetParticipantId,
        event_id: targetSubEventId,
        registration_id: targetRegistrationId,
        status: 'Present',
        scanner_admin_id: user.id,
        source: 'QR_Scanner'
      }]);

    if (attendanceError) {
      if (
        (attendanceError as any).code === '23505' || 
        attendanceError.message?.toLowerCase().includes('unique') ||
        attendanceError.message?.toLowerCase().includes('duplicate')
      ) {
        return NextResponse.json({ error: `Ticket already checked in! Duplicate scan detected for ${targetSubEvent.title}.` }, { status: 400 });
      }
      console.error('Attendance Insertion Error:', attendanceError);
      return NextResponse.json({ error: 'Failed to record attendance in database.' }, { status: 500 });
    }

    // Revalidate paths to update Present/Pending statistics in real-time
    try {
      revalidatePath('/coordinator/events');
      revalidatePath('/coordinator/attendance');
      revalidatePath('/coordinator/participants');
      revalidatePath('/coordinator/scanner');
      revalidatePath('/coordinator');
      revalidatePath('/admin');
    } catch (e) {
      console.warn("Revalidation warning in scan route:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Attendance marked successfully for ${targetSubEvent.title}!`,
      participantName: participantProfile.full_name || 'Verified Participant',
      registerNo: participantProfile.register_number || participantProfile.email || targetParticipantId.slice(0, 8),
      eventName: targetSubEvent.title,
      eventCategory: targetSubEvent.category || 'General',
      location: targetSubEvent.location || 'Venue TBD',
      ticketType: 'QR Ticket Verified'
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Scan API Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error during validation' }, { status: 500 });
  }
}

