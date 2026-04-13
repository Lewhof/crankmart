import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT title, province, city, event_date_start FROM events WHERE province ILIKE '%free state%' OR province ILIKE '%FS%' ORDER BY event_date_start` as any[];
  console.log('Free State events in DB:', rows.length);
  rows.forEach((r: any) => console.log(' -', r.title, '|', r.city, '|', r.event_date_start?.toString().substring(0,10)));
  
  const all = await sql`SELECT province, COUNT(*) as c FROM events GROUP BY province ORDER BY count DESC` as any[];
  console.log('\nAll events by province:');
  all.forEach((r: any) => console.log(' ', r.province + ':', r.c));
}
main().catch(console.error);
