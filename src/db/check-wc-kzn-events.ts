import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const wc = await sql`SELECT title FROM events WHERE province = 'Western Cape' ORDER BY event_date_start` as any[];
  console.log('WC events:', wc.length);
  wc.forEach((r: any) => console.log(' -', r.title));
  const kzn = await sql`SELECT title FROM events WHERE province = 'KwaZulu-Natal' ORDER BY event_date_start` as any[];
  console.log('\nKZN events:', kzn.length);
  kzn.forEach((r: any) => console.log(' -', r.title));
}
main().catch(console.error);
