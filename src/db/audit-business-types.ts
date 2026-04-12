import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
async function run() {
  const types = await sql`
    SELECT business_type, COUNT(*) as n 
    FROM businesses 
    GROUP BY business_type 
    ORDER BY n DESC
  `;
  console.log("\n=== All business_type values in DB ===");
  types.forEach((r: any) => console.log(`  ${r.business_type}: ${r.n}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
