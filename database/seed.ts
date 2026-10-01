import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We MUST use the service role key to forcefully insert into the database
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local. Make sure SUPABASE_SERVICE_ROLE_KEY is set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyEvents = [
  {
    event_code: 'TECH_01',
    name: 'Code Marathon',
    description: 'A 24-hour hackathon to solve real-world problems.',
    category: 'Technical',
    participation_type: 'Team',
    capacity: 50,
    status: 'Open',
  },
  {
    event_code: 'TECH_02',
    name: 'Bug Hunter Pro',
    description: 'Find and fix the bugs in complex algorithms fastest to win.',
    category: 'Technical',
    participation_type: 'Individual',
    capacity: 100,
    status: 'Open',
  },
  {
    event_code: 'TECH_03',
    name: 'AI Model Showcase',
    description: 'Present your coolest Artificial Intelligence models.',
    category: 'Technical',
    participation_type: 'Team',
    capacity: 30,
    status: 'Open',
  },
  {
    event_code: 'TECH_04',
    name: 'Web Wizardry',
    description: 'Frontend UI/UX challenge using modern frameworks.',
    category: 'Technical',
    participation_type: 'Individual',
    capacity: 60,
    status: 'Open',
  },
  {
    event_code: 'NON_01',
    name: 'Valorant Championship',
    description: 'Intense 5v5 gaming tournament.',
    category: 'Non-Technical',
    participation_type: 'Team',
    capacity: 120,
    status: 'Open',
  },
  {
    event_code: 'NON_02',
    name: 'Campus Treasure Hunt',
    description: 'Campus-wide scavenger hunt with exciting clues.',
    category: 'Non-Technical',
    participation_type: 'Team',
    capacity: 80,
    status: 'Open',
  },
  {
    event_code: 'NON_03',
    name: 'Photography Contest',
    description: 'Capture the best moments of Verve26.',
    category: 'Non-Technical',
    participation_type: 'Individual',
    capacity: 40,
    status: 'Open',
  },
  {
    event_code: 'NON_04',
    name: 'Mystery Escape Room',
    description: 'Escape the room by solving puzzles in under 30 minutes.',
    category: 'Non-Technical',
    participation_type: 'Team',
    capacity: 50,
    status: 'Open',
  }
];

async function seed() {
  console.log("🚀 Seeding dummy events to Supabase database...");
  
  // Note: We are not deleting existing events to prevent accidental data loss.
  // These new events will simply be added alongside existing ones.
  const { data, error } = await supabase
    .from('events')
    .insert(dummyEvents)
    .select();

  if (error) {
    if (error.code === '23505') {
      console.error("❌ Seeding failed: Some dummy events already exist (Unique constraint violation).");
    } else {
      console.error("❌ Error inserting events:", error.message, error);
    }
  } else {
    console.log(`✅ Successfully seeded ${data.length} dummy events!`);
    console.log("You can now view them dynamically in your frontend Registration Form.");
  }
}

seed();
