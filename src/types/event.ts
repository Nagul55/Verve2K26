export type EventCategory = 'Technical' | 'Non-Technical';
export type ParticipationType = 'Individual' | 'Team';
export type SubEventStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'LIVE' | 'REJECTED' | 'CLOSED' | 'COMPLETED';
export type FestStatus = 'DRAFT' | 'LIVE' | 'CLOSED' | 'COMPLETED';

export interface Fest {
  id: string;
  name: string;
  description: string;
  min_technical: number;
  min_non_technical: number;
  registration_closes_at?: string | null;
  allowed_departments?: string | null;
  status?: FestStatus | string;
  created_at: string;
  imageUrl?: string | null;
  logo_url?: string | null;
  event_type?: string;
}

export interface SubEvent {
  id: string;
  fest_id: string;
  category: EventCategory;
  participation_type: ParticipationType;
  min_candidates: number;
  max_candidates: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image_type?: string | null;
  whatsapp_group_link?: string | null;
  status?: SubEventStatus | string;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  parentFestName?: string;
  coordinatorNames?: string[];
  coordinatorName?: string;
  coordinatorCount?: number;
  cleanDescription?: string;
  rules?: string;
  prize_pool?: string;
  contact_info?: string;
  fee?: string;
  isOver?: boolean;
  isLive?: boolean;
  effectiveStatus?: string;
}
