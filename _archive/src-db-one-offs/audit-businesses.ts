import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function run() {
  // Total + status breakdown
  const status = await sql`
    SELECT listing_status, COUNT(*) as count 
    FROM businesses 
    GROUP BY listing_status 
    ORDER BY count DESC
  `;
  console.log('\n=== Status breakdown ===');
  status.forEach((r: any) => console.log(`  ${r.listing_status ?? 'NULL'}: ${r.count}`));

  // Province breakdown (active only)
  const byProv = await sql`
    SELECT province, COUNT(*) as count 
    FROM businesses 
    WHERE listing_status = 'active'
    GROUP BY province 
    ORDER BY count DESC
  `;
  console.log('\n=== Active by province ===');
  byProv.forEach((r: any) => console.log(`  ${r.province ?? 'NULL'}: ${r.count}`));

  // Check pagination — how many pages at default limit 20
  const total = await sql`SELECT COUNT(*) as total FROM businesses WHERE listing_status = 'active'`;
  const t = parseInt((total[0] as any).total);
  console.log(`\n=== Pagination ===`);
  console.log(`  Total active: ${t}`);
  console.log(`  Pages at limit=20: ${Math.ceil(t/20)}`);
  console.log(`  Pages at limit=100: ${Math.ceil(t/100)}`);

  // Check seeded but maybe different status values
  const allStatuses = await sql`SELECT DISTINCT listing_status FROM businesses`;
  console.log('\n=== All distinct listing_status values ===');
  allStatuses.forEach((r: any) => console.log(`  "${r.listing_status}"`));

  // Sample of non-active
  const nonActive = await sql`
    SELECT id, name, listing_status FROM businesses 
    WHERE listing_status != 'active' OR listing_status IS NULL
    LIMIT 10
  `;
  console.log(`\n=== Non-active sample (${nonActive.length}) ===`);
  nonActive.forEach((r: any) => console.log(`  ${r.name} → "${r.listing_status}"`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
