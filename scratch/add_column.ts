import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Extract ref from NEXT_PUBLIC_SUPABASE_URL (https://dikpdjnycrhyxtqrarug.supabase.co) -> dikpdjnycrhyxtqrarug
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function addColumn() {
  console.log("Project ref:", projectRef);
  
  // Try connecting via standard Supabase postgres connection strings
  const connectionStrings = [
    `postgresql://postgres:${serviceKey}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${serviceKey}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
  ];

  for (const connStr of connectionStrings) {
    try {
      console.log("Trying connection string...");
      const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();
      console.log("Connected successfully!");
      
      const res = await client.query(`
        ALTER TABLE fests ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;
      `);
      console.log("Migration result:", res);
      await client.end();
      return;
    } catch (err: any) {
      console.error("Connection failed:", err.message);
    }
  }
}

addColumn();
