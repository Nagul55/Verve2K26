import { getCoordinators } from '../src/actions/event.actions';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const coords = await getCoordinators();
  console.log('GET COORDINATORS RESULT:');
  coords.forEach(c => console.log(c));
}

main().catch(console.error);
