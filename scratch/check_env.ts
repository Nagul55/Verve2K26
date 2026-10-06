import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('ENV KEYS:', Object.keys(process.env).filter(k => k.includes('PASS') || k.includes('KEY') || k.includes('DB') || k.includes('SUPABASE')));
