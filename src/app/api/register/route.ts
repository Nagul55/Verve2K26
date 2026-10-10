import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateTicketQR } from '@/features/registration/services/qr.service';
import { sendTicketEmail } from '@/features/registration/services/email.service';

// We now use the SUPABASE_SERVICE_ROLE_KEY to strongly configure the backend.
// This allows the secure server-side route to bypass the RLS policies and perform inserts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      registerNumber, 
      email, 
      mobile, 
      department, 
      yearOfStudy, 
      section, 
      college, 
      selectedEventIds 
    } = body;

    // Basic server-side validation
    if (!selectedEventIds || selectedEventIds.length !== 2) {
      return NextResponse.json({ error: 'You must select exactly 2 events (1 Technical, 1 Non-Technical).' }, { status: 400 });
    }

    // 0. Server-Side Fest Registration Deadline Check & Capacity Check
    if (selectedEventIds && selectedEventIds.length > 0) {
      const { data: subEventsInfo } = await supabase
        .from('sub_events')
        .select('id, title, capacity, fest_id, fests(registration_closes_at, allowed_departments)')
        .in('id', selectedEventIds);

      const festData = (subEventsInfo?.[0] as any)?.fests;
      const deadline = festData?.registration_closes_at;
      if (deadline && new Date() >= new Date(deadline)) {
        return NextResponse.json({ error: 'Registration for this fest has closed.' }, { status: 400 });
      }

      const { isUserEligibleForEvent } = await import('@/lib/utils/eligibility');
      if (!isUserEligibleForEvent(department, festData?.allowed_departments)) {
        return NextResponse.json({ error: 'You are not eligible for this fest based on your department.' }, { status: 400 });
      }

      for (const sub of (subEventsInfo || [])) {
        const { count: occupiedCount } = await supabase
          .from('registration_sub_events')
          .select('*', { count: 'exact', head: true })
          .eq('sub_event_id', sub.id);

        const hasCapacity = typeof sub.capacity === 'number' && sub.capacity > 0;
        if (hasCapacity && (occupiedCount || 0) >= sub.capacity) {
          return NextResponse.json({ error: `Registration for "${sub.title}" is closed. All seats have been filled (${occupiedCount}/${sub.capacity}).` }, { status: 400 });
        }
      }
    }

    // 1. Insert Participant
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .insert([{
        full_name: fullName,
        register_number: registerNumber,
        email: email.toLowerCase().trim(),
        mobile,
        department,
        year_of_study: yearOfStudy,
        section,
        college
      }])
      .select('participant_id')
      .single();

    if (participantError) {
      // Check for unique constraint violation on email
      if (participantError.code === '23505') {
         return NextResponse.json({ error: 'A participant with this email has already registered.' }, { status: 400 });
      }
      throw participantError;
    }

    const participantId = participantData.participant_id;

    // 2. Insert Registrations
    const registrationInserts = selectedEventIds.map((eventId: string) => ({
      participant_id: participantId,
      event_id: eventId,
      status: 'Confirmed'
    }));

    const { data: regData, error: regError } = await supabase
      .from('event_registrations')
      .insert(registrationInserts)
      .select('registration_id');

    if (regError) {
      // Manual rollback if the registration step fails (e.g. capacity trigger fired)
      await supabase.from('participants').delete().eq('participant_id', participantId);
      
      // Check if it was our custom capacity trigger
      if (regError.message.includes('Event capacity reached')) {
         return NextResponse.json({ error: 'One of your selected events has reached maximum capacity.' }, { status: 400 });
      }
      throw regError;
    }

    // 3. Generate one Universal QR Code (using Participant ID) for the email
    const qrDataUri = await generateTicketQR(participantId);

    // 4. Save QR Tickets to Database for each registration (Event specific scanning)
    const qrInserts = regData.map(reg => ({
      registration_id: reg.registration_id,
      token_hash: reg.registration_id, // We use the registration UUID as the token
      status: 'Active'
    }));

    const { error: qrError } = await supabase.from('qr_tickets').insert(qrInserts);
    
    if (qrError) {
      console.error("Failed to save QR to DB, but registration succeeded.", qrError);
    }

    // 5. Send Confirmation Email with QR Attachment
    try {
      await sendTicketEmail(email, fullName, qrDataUri);
    } catch (emailErr) {
      console.error("Non-fatal: Failed to dispatch email, but registration succeeded.", emailErr);
    }

    return NextResponse.json({ success: true, participantId }, { status: 200 });
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
