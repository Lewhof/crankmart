import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  // Update wines2whales event to force cache bust
  await sql`UPDATE events SET cover_image_url = 'https://cyclemart.co.za/uploads/events/wines2whales.jpg?v=20260330' WHERE slug = 'wines2whales-mtb' OR title ILIKE '%wines2whales%' OR title ILIKE '%wine%whale%'`;
  const r = await sql`SELECT title, cover_image_url FROM events WHERE title ILIKE '%wines2whales%' OR title ILIKE '%wine%whale%'` as any[];
  r.forEach((e: any) => console.log(e.title, '→', e.cover_image_url));
}
main().catch(console.error);
