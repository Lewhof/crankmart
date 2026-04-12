import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  // Add ?v=20260330 to ALL event cover_image_urls to force browser cache bust
  const rows = await sql`SELECT id, title, cover_image_url FROM events` as any[];
  for (const r of rows) {
    if (!r.cover_image_url) continue;
    const url = r.cover_image_url.replace(/\?v=\d+$/, '') + '?v=20260330';
    await sql`UPDATE events SET cover_image_url = ${url} WHERE id = ${r.id}`;
    console.log(`✅ ${r.title}`);
  }
  console.log('\nAll events cache-busted');
}
main().catch(console.error);
