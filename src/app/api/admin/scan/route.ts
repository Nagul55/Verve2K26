import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAccess } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Strongly configuring the backend: We use the SERVICE ROLE key to securely bypass RLS 
// exclusively inside this secure server-side API route.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { pid, event_id } = await req.json();

    if (!pid || !event_id) {
      return NextResponse.json({ error: 'Missing Participant ID or Event ID from Scanner payload.' }, { status: 400 });
    }

    // --- STRICT RBAC SECURITY CHECK ---
    const authResult = await verifyAdminAccess(req, event_id);
    if (!authResult.authorized || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized access' }, { status: 401 });
    }
    // Override any client-provided admin ID with the securely verified token ID
    const secureAdminId = authResult.user.id;

    // 1. Verify that the participant actually registered for this specific event
    const { data: regData, error: regError } = await supabase
      .from('event_registrations')
      .select('registration_id, status')
      .eq('participant_id', pid)
      .eq('event_id', event_id)
      .single();

    if (regError || !regData) {
      return NextResponse.json({ error: 'Access Denied: Participant is not registered for this specific event.' }, { status: 404 });
    }

    if (regData.status === 'Cancelled') {
      return NextResponse.json({ error: 'Access Denied: This registration was previously cancelled.' }, { status: 400 });
    }

    // 2. Check the Ticket Status in the Database
    const { data: ticketData, error: ticketError } = await supabase
      .from('qr_tickets')
      .select('ticket_id, status')
      .eq('registration_id', regData.registration_id)
      .single();

    if (ticketError || !ticketData) {
      return NextResponse.json({ error: 'Ticket records not found for this registration.' }, { status: 404 });
    }

    if (ticketData.status === 'Used') {
      return NextResponse.json({ error: 'Warning: This ticket has already been USED. Participant is already checked in.' }, { status: 400 });
    }

    if (ticketData.status === 'Revoked') {
      return NextResponse.json({ error: 'Access Denied: This ticket has been REVOKED.' }, { status: 400 });
    }

    // 3. Update the Ticket to 'Used'
    const { error: updateError } = await supabase
      .from('qr_tickets')
      .update({ status: 'Used' })
      .eq('ticket_id', ticketData.ticket_id);

    if (updateError) {
      throw new Error('Failed to update ticket status in database.');
    }

    // 4. Insert into the Attendance Tracker
    const { error: attendanceError } = await supabase
      .from('attendance')
      .insert([{
        participant_id: pid,
        event_id: event_id,
        registration_id: regData.registration_id,
        status: 'Present',
        scanner_admin_id: secureAdminId, // Securely logged from the JWT token
        source: 'QR_Scanner'
      }]);

    if (attendanceError) {
      // Revert the ticket status back to Active if the attendance insert fails
      await supabase.from('qr_tickets').update({ status: 'Active' }).eq('ticket_id', ticketData.ticket_id);
      throw new Error('Failed to record attendance accurately.');
    }

    return NextResponse.json({ success: true, message: 'Check-in successful! Ticket is valid.' }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Scan API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error during validation' }, { status: 500 });
  }
}
