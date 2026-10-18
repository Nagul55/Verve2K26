export interface RegistrationItem {
  id: string;
  participant_id: string;
  fest_id: string;
  created_at: string;
  sub_events?: Array<{
    sub_event_id: string;
    sub_events?: any;
  }>;
}

export interface TicketData {
  ticket_id: string;
  participant_id: string;
  participant_name: string;
  event_name: string;
  venue: string;
  date: string;
  time: string;
  qr_code: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
}
