import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function checkSchema() {
  const result = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'businesses'
    ORDER BY ordinal_position
  `;
  console.log("Businesses table columns:");
  result.forEach((col: any) => {
    console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  // Check for status column specifically
  const hasStatus = result.some((col: any) => col.column_name === 'status');
  console.log(`\n✓ Has 'status' column: ${hasStatus}`);
  
  process.exit(0);
}

checkSchema();
