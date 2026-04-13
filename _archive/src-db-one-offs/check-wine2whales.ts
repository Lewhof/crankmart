import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT id, name, slug, cover_url, logo_url FROM businesses WHERE name ILIKE '%wine%' OR name ILIKE '%whale%' OR slug ILIKE '%wine%' OR slug ILIKE '%whale%'` as any[];
  console.log('Found:', rows.length);
  rows.forEach((r: any) => console.log(r.name, '|', r.slug, '\n  cover:', r.cover_url, '\n  logo:', r.logo_url));
  
  // Also audit ALL event organiser covers - what domains/sources are they from
  console.log('\n=== ALL EVENT COVER SOURCES ===');
  const all = await sql`SELECT name, slug, cover_url FROM businesses WHERE business_type = 'event_organiser' ORDER BY name` as any[];
  all.forEach((r: any) => {
    const url = r.cover_url || 'NULL';
    const source = url.startsWith('http') ? new URL(url).hostname : url.startsWith('/api') ? 'placeholder' : url.substring(0,40);
    console.log(r.name + '\n  ' + source);
  });
}
main().catch(console.error);
