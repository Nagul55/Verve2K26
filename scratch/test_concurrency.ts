import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('--- TESTING FULL CAPACITY LOCK SIMULATION ---');

  const subEvent = {
    id: '4d6554ef-b13d-40ca-9aed-04487b570611',
    title: 'POSTER PROMPTING',
    capacity: 2 // Simulated limit of 2 for testing
  };

  const { count: occupiedCount } = await adminClient
    .from('registration_sub_events')
    .select('*', { count: 'exact', head: true })
    .eq('sub_event_id', subEvent.id);

  console.log(`Current occupied seats in DB: ${occupiedCount}/${subEvent.capacity}`);

  const requestedSeats = 1;

  const checkCapacity = (currentOccupied: number, reqSeats: number, cap: number) => {
    if (currentOccupied + reqSeats > cap) {
      return { success: false, error: 'EVENT_FULL', message: `Registration closed for "${subEvent.title}". All seats are filled (${currentOccupied}/${cap}).` };
    }
    return { success: true };
  };

  const resultWhenFull = checkCapacity(occupiedCount || 2, requestedSeats, subEvent.capacity);
  console.log('Result when capacity is full (2/2):', resultWhenFull);

  const teamReqSeats = 3; // Team size 3 trying to register when 1 seat left
  const resultForTeamOverbook = checkCapacity(1, teamReqSeats, 3);
  console.log('Result for team overbooking (1 + 3 = 4 > 3):', resultForTeamOverbook);
}

main().catch(console.error);
