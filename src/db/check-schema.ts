import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'businesses'
      ORDER BY ordinal_position
    `;
    console.log("Businesses table columns:");
    (result as any[]).forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  } catch (e) {
    console.error("Error:", (e as any).message);
  }
}

check();
