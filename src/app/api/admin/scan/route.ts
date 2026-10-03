import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Strongly configuring the backend: We use the SERVICE ROLE key to securely bypass RLS 
// exclusively inside this secure server-side API route.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { pid, event_id } = await req.json();

    if (!pid || !event_id) {
      return NextResponse.json({ error: 'Missing Participant ID or Event ID from Scanner payload.' }, { status: 400 });
    }

    // --- STRICT RBAC SECURITY CHECK ---
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    // Check if user is an admin or coordinator
    const role = user.app_metadata?.role;
    if (role !== 'admin' && role !== 'Super Admin' && role !== 'coordinator') {
      return NextResponse.json({ error: 'Access Denied: You do not have scanner privileges.' }, { status: 403 });
    }

    const secureAdminId = user.id;

    // 1. Verify that the participant actually registered for this specific sub_event
    const { data: regData, error: regError } = await supabaseAdmin
      .from('registration_sub_events')
      .select(`
        registrations!inner (
          id,
          participant_id,
          participants (full_name, register_number)
        )
      `)
      .eq('sub_event_id', event_id)
      .eq('registrations.participant_id', pid)
      .single();



    if (regError || !regData) {
      return NextResponse.json({ error: 'Access Denied: Participant is not registered for this specific event.' }, { status: 404 });
    }

    const participantInfo = (regData.registrations as any).participants;
    const registrationId = (regData.registrations as any).id;

    // 2. Check if already checked in (using attendance table)
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendance')
      .select('attendance_id')
      .eq('participant_id', pid)
      .eq('event_id', event_id)
      .single();

    if (existingAttendance) {
      return NextResponse.json({ error: 'Warning: This ticket has already been USED. Participant is already checked in.' }, { status: 400 });
    }

    // 3. Record Attendance
    const { error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .insert([{
        participant_id: pid,
        event_id: event_id,
        // Since qr_tickets is not used for sub_events, we just log the registration id
        registration_id: registrationId,
        status: 'Present',
        scanner_admin_id: secureAdminId,
        source: 'QR_Scanner'
      }]);

    if (attendanceError) {
      console.error('Attendance Check-in Error:', attendanceError);
      throw new Error('Failed to record attendance accurately.');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Check-in successful! Ticket is valid.',
      participantName: participantInfo?.full_name || 'Verified Participant',
      registerNo: participantInfo?.register_number || pid.substring(0, 8)
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Scan API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error during validation' }, { status: 500 });
  }
}
