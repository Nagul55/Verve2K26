import { getFests } from '../src/actions/event.actions';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyGetFests() {
  console.log("=== TESTING getFests() ACTION ===");
  const fests = await getFests();
  console.log("Returned Fests length:", fests?.length);
  console.log("Returned Fests data:", JSON.stringify(fests, null, 2));
}

verifyGetFests();
