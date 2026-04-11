import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function addStatusColumn() {
  console.log("\n🔧 Adding status column to businesses table\n");
  
  try {
    // Step 1: Create enum
    console.log("1. Creating business_status enum...");
    try {
      await sql`
        CREATE TYPE "business_status" AS ENUM('disabled', 'active', 'paused', 'removed')
      `;
      console.log("   ✓ Enum created");
    } catch (e: any) {
      if (e.code === '42710') {
        console.log("   ✓ Enum already exists");
      } else {
        throw e;
      }
    }
    
    // Step 2: Add column
    console.log("2. Adding status column...");
    await sql`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS status business_status DEFAULT 'disabled' NOT NULL
    `;
    console.log("   ✓ Column added");
    
    // Step 3: Add index
    console.log("3. Adding index...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status)
    `;
    console.log("   ✓ Index created");
    
    // Step 4: Verify
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'businesses' AND column_name = 'status'
    `;
    
    if (result.length > 0) {
      console.log(`\n✅ Success: status column added (${result[0].data_type})`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  }
}

addStatusColumn();
