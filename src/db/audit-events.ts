import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT name, slug, listing_status, province, website, logo_url, cover_url
    FROM businesses
    WHERE business_type = 'event_organiser'
    ORDER BY province, name
  ` as any[];

  console.log(`\nTotal event organisers in DB: ${rows.length}`);
  
  const active = rows.filter((r: any) => r.listing_status === 'active');
  const disabled = rows.filter((r: any) => r.listing_status !== 'active');
  console.log(`Active (visible on site): ${active.length}`);
  console.log(`Disabled/hidden: ${disabled.length}`);

  console.log('\n=== BY PROVINCE ===');
  const byProv: Record<string, any[]> = {};
  rows.forEach((r: any) => {
    const p = r.province || 'Unknown';
    if (!byProv[p]) byProv[p] = [];
    byProv[p].push(r);
  });
  Object.entries(byProv).sort().forEach(([prov, bizs]) => {
    const activeCount = bizs.filter((b: any) => b.listing_status === 'active').length;
    console.log(`\n${prov} (${activeCount}/${bizs.length} active):`);
    bizs.forEach((b: any) => {
      const status = b.listing_status === 'active' ? '✅' : '❌';
      const img = b.cover_url ? '🖼' : '📷';
      console.log(`  ${status} ${img} ${b.name}`);
    });
  });
}
main().catch(console.error);
