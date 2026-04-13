import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT title, slug, cover_image_url FROM events ORDER BY is_featured DESC, title ASC` as any[];
  rows.forEach((r: any) => console.log(r.title + '\n  ' + (r.cover_image_url || 'NULL')));
}
main().catch(console.error);
