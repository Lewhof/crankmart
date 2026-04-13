import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const types = await sql`SELECT unnest(enum_range(NULL::event_type))` as any[];
  console.log('event_type values:', types.map((r: any) => Object.values(r)[0]).join(', '));
  const status = await sql`SELECT unnest(enum_range(NULL::event_status))` as any[];
  console.log('event_status values:', status.map((r: any) => Object.values(r)[0]).join(', '));
  // Check existing events to see what values they use
  const sample = await sql`SELECT event_type, status FROM events LIMIT 3` as any[];
  console.log('Sample events:', JSON.stringify(sample));
}
main().catch(console.error);
