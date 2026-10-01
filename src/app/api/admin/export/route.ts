import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { verifyAdminAccess } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// In production, this route should enforce Admin Auth by checking cookies/headers.
const supabase = createClient(supabaseUrl, supabaseKey);

interface JoinedParticipant {
  full_name: string;
  register_number: string;
  email: string;
  mobile: string;
  college: string;
  department: string;
  year_of_study: string;
  section: string | null;
  created_at: string;
  event_registrations: {
    status: string;
    events: { name: string; category: string } | null;
  }[] | null;
}

export async function GET(req: Request) {
  try {
    // --- STRICT RBAC SECURITY CHECK ---
    const authResult = await verifyAdminAccess(req);
    if (!authResult.authorized) {
      return new NextResponse(`401 Unauthorized: ${authResult.error}`, { status: 401 });
    }
    
    // Exports contain sensitive PII. Restrict to Super Admins only.
    if (authResult.role !== 'Super Admin') {
      return new NextResponse('403 Forbidden: Only Super Admins can export the master dataset.', { status: 403 });
    }

    // 1. Fetch participants and join their registered events using Supabase foreign keys
    const { data, error } = await supabase
      .from('participants')
      .select(`
        full_name,
        register_number,
        email,
        mobile,
        college,
        department,
        year_of_study,
        section,
        created_at,
        event_registrations (
          status,
          events (
            name,
            category
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 2. Flatten the nested data structure into a clean 1D array for the CSV generator
    const flattenedData = (data as unknown as JoinedParticipant[]).map((p) => {
      // Extract and concatenate the event names they are confirmed for
      const registeredEvents = p.event_registrations
        ?.filter(r => r.status === 'Confirmed')
        .map(r => r.events?.name)
        .join(', ') || 'None';

      return {
        'Full Name': p.full_name,
        'Register Number': p.register_number,
        'Email': p.email,
        'Mobile': p.mobile,
        'College': p.college,
        'Department': p.department,
        'Year': p.year_of_study,
        'Section': p.section || '',
        'Registered Events': registeredEvents,
        'Registration Date': new Date(p.created_at).toLocaleString()
      };
    });

    // 3. Convert JSON to CSV using PapaParse
    const csv = Papa.unparse(flattenedData);

    // 4. Return the HTTP response forcing a file download
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="verve26_participants_export.csv"'
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Export API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error during CSV generation' }, { status: 500 });
  }
}
