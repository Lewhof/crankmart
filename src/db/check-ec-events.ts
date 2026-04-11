import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT title, slug FROM events WHERE province = 'Eastern Cape' ORDER BY event_date_start` as any[];
  console.log('Current EC events:', rows.length);
  rows.forEach((r: any) => console.log(' -', r.title, '|', r.slug));
}
main().catch(console.error);
