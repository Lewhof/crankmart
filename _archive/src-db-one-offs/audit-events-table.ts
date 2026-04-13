import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const total = await sql`SELECT COUNT(*) as c FROM events` as any[];
  console.log('Total events:', total[0].c);
  
  const rows = await sql`
    SELECT title, slug, cover_image_url, is_featured, event_date_start
    FROM events ORDER BY is_featured DESC, event_date_start ASC LIMIT 40
  ` as any[];
  
  rows.forEach((r: any) => {
    const url = r.cover_image_url || 'NULL';
    const src = url.startsWith('http') ? new URL(url).hostname : url.substring(0,50);
    const feat = r.is_featured ? '⭐' : '  ';
    console.log(`${feat} ${r.title}`);
    console.log(`     img: ${src}`);
  });
}
main().catch(console.error);
