import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT title, slug, event_date_start FROM events WHERE province = 'Gauteng' ORDER BY event_date_start` as any[];
  console.log('Current GP events:', rows.length);
  rows.forEach((r: any) => console.log(' -', r.title, '|', r.event_date_start?.toString().substring(0,10)));
}
main().catch(console.error);
