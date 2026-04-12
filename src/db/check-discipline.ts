import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const t = await sql`SELECT data_type, udt_name FROM information_schema.columns WHERE table_name='events' AND column_name='discipline'` as any[];
  console.log('discipline type:', JSON.stringify(t[0]));
  const sample = await sql`SELECT discipline FROM events LIMIT 5` as any[];
  console.log('sample discipline values:', JSON.stringify(sample));
}
main().catch(console.error);
