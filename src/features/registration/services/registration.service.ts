import { createClient } from '@/lib/supabase/client';
import { Event, RegistrationPayload } from '../types';

export const getOpenEvents = async (): Promise<Event[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('status', ['Open', 'Full'])
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to load events. Please try again.');
  }
  
  return data as Event[];
};

export const submitRegistration = async (payload: RegistrationPayload) => {
  // We send this to a server-side API route so it can safely execute 
  // the transaction (Participant Insert + 3 Registration Inserts).
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit registration');
  }

  return response.json();
};
