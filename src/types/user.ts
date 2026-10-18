export type UserRole = 'student' | 'coordinator' | 'admin' | 'Super Admin';

export interface ParticipantProfile {
  participant_id: string;
  full_name: string;
  email: string;
  mobile?: string | null;
  college?: string | null;
  register_number?: string | null;
  department?: string | null;
  year_of_study?: string | null;
  section?: string | null;
  created_at?: string;
}

export interface CoordinatorInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_ids: string[];
}
