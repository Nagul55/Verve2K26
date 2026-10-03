import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const msAuth = searchParams.get('ms_auth');
  const msEmail = searchParams.get('email');
  const msName = searchParams.get('name');
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();

  // Handle direct MSAL login return
  if (msAuth === 'true' && msEmail) {
    const adminClient = getAdminClient();

    // Check if user exists or create account
    const { data: listData } = await adminClient.auth.admin.listUsers();
    let targetUser = listData?.users.find(u => u.email?.toLowerCase() === msEmail.toLowerCase());

    if (!targetUser) {
      const { data: newUser } = await adminClient.auth.admin.createUser({
        email: msEmail,
        email_confirm: true,
        user_metadata: { full_name: msName || msEmail.split('@')[0] },
        app_metadata: { role: 'student' }
      });
      targetUser = newUser?.user || undefined;
    }

    if (targetUser) {
      // Ensure participant stub
      await adminClient.from('participants').upsert({
        participant_id: targetUser.id,
        full_name: msName || targetUser.user_metadata?.full_name || 'Participant',
        email: msEmail,
        mobile: '',
        department: '',
        year_of_study: '',
        college: '',
        register_number: ''
      }, { onConflict: 'participant_id' });

      // Generate a magic link or direct session link
      const { data: sessionData } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: msEmail
      });

      if (sessionData?.properties?.action_link) {
        return NextResponse.redirect(sessionData.properties.action_link);
      }
    }
  }

  // Handle Supabase OAuth authorization code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ensure participant record exists in participants table
        const { data: participant } = await supabase
          .from('participants')
          .select('participant_id')
          .eq('participant_id', user.id)
          .single();

        if (!participant) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Participant';
          await supabase.from('participants').upsert({
            participant_id: user.id,
            full_name: fullName,
            email: user.email || '',
            mobile: '',
            department: '',
            year_of_study: '',
            college: '',
            register_number: ''
          }, { onConflict: 'participant_id' });
        }

        const role = user.app_metadata?.role || 'student';
        if (role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (role === 'coordinator') {
          return NextResponse.redirect(`${origin}/coordinator`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
