import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function checkEnum() {
  const result = await sql`
    SELECT enumlabel
    FROM pg_enum
    WHERE enumtypid = 'business_status'::regtype
    ORDER BY enumsortorder
  `;
  console.log("business_status enum values:");
  result.forEach((row: any) => {
    console.log(`  - ${row.enumlabel}`);
  });
  process.exit(0);
}

checkEnum().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
