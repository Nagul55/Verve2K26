export type EventCategory = 'Technical' | 'Non-Technical';
export type ParticipationType = 'Individual' | 'Team';
export type EventStatus = 'Draft' | 'Open' | 'Full' | 'Closed' | 'Cancelled' | 'Archived';

export interface Event {
  event_id: string;
  event_code: string;
  name: string;
  description: string | null;
  category: EventCategory;
  participation_type: ParticipationType;
  capacity: number;
  status: EventStatus;
}

export interface RegistrationPayload {
  fullName: string;
  registerNumber: string;
  email: string;
  mobile: string;
  department: string;
  yearOfStudy: string;
  section?: string;
  college: string;
  selectedEventIds: string[]; // Exactly 2 (1 tech, 1 non-tech)
}
