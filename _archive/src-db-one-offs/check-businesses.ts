import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  console.log("📊 Checking businesses table...\n");
  
  const statusCount = await sql`
    SELECT status, verified, COUNT(*) as count 
    FROM businesses 
    GROUP BY status, verified 
    ORDER BY status, verified
  `;
  
  console.log("By status & verification:");
  console.table(statusCount);
  
  const total = await sql`SELECT COUNT(*) as total FROM businesses`;
  console.log(`\n✅ Total businesses: ${total[0].total}`);
  
  const sampleDisabled = await sql`
    SELECT name, city, province, business_type, verified, status
    FROM businesses 
    WHERE status = 'disabled'
    LIMIT 10
  `;
  
  console.log("\n📋 Sample disabled businesses:");
  console.table(sampleDisabled);
}

check().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
