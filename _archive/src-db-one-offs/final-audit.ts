import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const byProv = await sql`
    SELECT province, COUNT(*) as count
    FROM businesses WHERE business_type = 'event_organiser'
    GROUP BY province ORDER BY count DESC
  ` as any[];
  const total = await sql`SELECT COUNT(*) as c FROM businesses WHERE business_type = 'event_organiser'` as any[];
  console.log(`Total event organisers: ${total[0].c}`);
  byProv.forEach((r: any) => console.log(`  ${r.province}: ${r.count}`));
}
main().catch(console.error);
