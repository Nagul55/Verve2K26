import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  department?: string;
  year_of_study?: string;
  gender?: string;
  college_name?: string;
  phone_number?: string;
  register_number?: string;
  avatar_url?: string;
  role?: string;
}

export interface AuthUserResult {
  user: User | null;
  profile: UserProfile | null;
  role: string;
}

/**
 * React cache() memoizes this function per request.
 * Multiple calls to getCurrentUser() within a single HTTP request render tree
 * will only execute the Supabase auth & profile database call ONCE.
 */
export const getCurrentUser = cache(async (): Promise<AuthUserResult> => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, profile: null, role: 'student' };
    }

    const role = (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'student';

    // Fetch user profile efficiently selecting only required fields
    const { data: profile } = await supabase
      .from('participants')
      .select('id, full_name, department, year_of_study, gender, college_name, phone_number, register_number, avatar_url')
      .eq('participant_id', user.id)
      .maybeSingle();

    const formattedProfile: UserProfile | null = profile
      ? {
          id: user.id,
          full_name: profile.full_name || user.user_metadata?.full_name || 'STUDENT',
          department: profile.department || '',
          year_of_study: profile.year_of_study || '',
          gender: profile.gender || user.user_metadata?.gender || '',
          college_name: profile.college_name || '',
          phone_number: profile.phone_number || '',
          register_number: profile.register_number || '',
          avatar_url: profile.avatar_url || '',
          role: role,
        }
      : {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'STUDENT',
          gender: user.user_metadata?.gender || '',
          role: role,
        };

    return {
      user,
      profile: formattedProfile,
      role,
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return { user: null, profile: null, role: 'student' };
  }
});
