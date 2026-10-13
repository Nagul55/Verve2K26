import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import * as Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// We need service role to fetch all users, but we'll use cookie-client to verify who is requesting
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse(`401 Unauthorized: Not logged in`, { status: 401 });
    }

    // Check role in user metadata
    const role = user.app_metadata?.role;
    
    // Exports contain sensitive PII. Restrict to Admin/Super Admin/Coordinator.
    if (role !== 'admin' && role !== 'Super Admin' && role !== 'coordinator') {
      return new NextResponse('403 Forbidden: Insufficient permissions to export datasets.', { status: 403 });
    }

    // Support event-wise export if sub_event_id is provided
    const url = new URL(req.url);
    const subEventId = url.searchParams.get('sub_event_id');

    // 1. Fetch participants and their registered sub-events
    let query = supabaseAdmin
      .from('participants')
      .select(`
        participant_id,
        full_name,
        register_number,
        email,
        mobile,
        college,
        department,
        year_of_study,
        section,
        created_at,
        registrations!inner (
          registration_sub_events!inner (
            sub_events (
              id,
              title,
              category
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch attendance data for the event (or all events if no specific subEventId)
    let attendanceQuery = supabaseAdmin.from('attendance').select('participant_id, event_id, status');
    if (subEventId) {
      attendanceQuery = attendanceQuery.eq('event_id', subEventId);
    }
    const { data: attendanceData } = await attendanceQuery;
    
    // Create a Set of participant IDs who are present for fast lookup
    const presentParticipantIds = new Set(
      (attendanceData || [])
        .filter(a => a.status === 'Present')
        .map(a => a.participant_id)
    );

    // 2. Filter and flatten data
    let processedData = data as any[];

    // If exporting for a specific event, filter the participants first
    if (subEventId) {
      processedData = processedData.filter((p) => {
        if (!p.registrations) return false;
        return p.registrations.some((reg: any) => 
          reg.registration_sub_events?.some((rse: any) => rse.sub_events?.id === subEventId)
        );
      });
    }

    // Fetch teams mapping to populate Team Name in CSV
    const teamNameMap = new Map<string, string>();
    let teamsQuery = supabaseAdmin
      .from('teams')
      .select('team_name, event_id, team_members(participant_id)');
    if (subEventId) {
      teamsQuery = teamsQuery.eq('event_id', subEventId);
    }
    const { data: teamsData } = await teamsQuery;
    (teamsData || []).forEach((t: any) => {
      (t.team_members || []).forEach((tm: any) => {
        if (tm.participant_id) {
          teamNameMap.set(tm.participant_id, t.team_name);
        }
      });
    });

    let eventTitle = '';
    if (subEventId) {
      const { data: subEvent } = await supabaseAdmin
        .from('sub_events')
        .select('title')
        .eq('id', subEventId)
        .single();
      if (subEvent?.title) {
        eventTitle = subEvent.title;
      }
    }

    const flattenedData = processedData.map((p) => {
      // Extract all sub-events they are registered for
      const registeredEvents: string[] = [];
      p.registrations?.forEach((reg: any) => {
        reg.registration_sub_events?.forEach((rse: any) => {
          if (rse.sub_events?.title) {
            registeredEvents.push(rse.sub_events.title);
          }
        });
      });

      return {
        'Full Name': p.full_name,
        'Team Name': teamNameMap.get(p.participant_id) || 'Individual',
        'Register Number': p.register_number,
        'Email': p.email,
        'Mobile': p.mobile,
        'College': p.college,
        'Department': p.department,
        'Year': p.year_of_study,
        'Section': p.section || '',
        'Registered Events': registeredEvents.length > 0 ? registeredEvents.join(', ') : 'None',
        'Attendance Status': presentParticipantIds.has(p.participant_id) ? 'Present' : 'Pending',
        'Registration Date': new Date(p.created_at).toLocaleString()
      };
    });

    // If there are no participants, add a dummy row so the CSV still generates headers and a sample structure
    if (flattenedData.length === 0) {
      flattenedData.push({
        'Full Name': 'DUMMY DATA (NO PARTICIPANTS YET)',
        'Team Name': 'N/A',
        'Register Number': 'N/A',
        'Email': 'dummy@example.com',
        'Mobile': '0000000000',
        'College': 'N/A',
        'Department': 'N/A',
        'Year': 'N/A',
        'Section': 'N/A',
        'Registered Events': 'None',
        'Attendance Status': 'Pending',
        'Registration Date': new Date().toLocaleString()
      });
    }

    // 3. Convert JSON to CSV using PapaParse
    const csv = Papa.unparse(flattenedData);

    const sanitize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 50);
    const filename = eventTitle ? `${sanitize(eventTitle)}_participants_export.csv` : 'verve26_participants_export.csv';

    // 4. Return the HTTP response forcing a file download with UTF-8 BOM
    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Export API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error during CSV generation' }, { status: 500 });
  }
}
