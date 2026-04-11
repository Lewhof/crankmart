import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function addListingStatus() {
  console.log("\n🔧 Adding listing_status column to businesses table\n");
  
  try {
    // Add column as VARCHAR with check constraint
    console.log("1. Adding listing_status column...");
    await sql`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) DEFAULT 'disabled' NOT NULL
        CHECK (listing_status IN ('disabled', 'active', 'paused', 'removed'))
    `;
    console.log("   ✓ Column added");
    
    // Add index
    console.log("2. Adding index...");
    await sql`
      CREATE INDEX IF NOT EXISTS idx_businesses_listing_status ON businesses(listing_status)
    `;
    console.log("   ✓ Index created");
    
    // Verify
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'businesses' AND column_name = 'listing_status'
    `;
    
    if (result.length > 0) {
      console.log(`\n✅ Success: listing_status column added (${result[0].data_type})`);
    }
    
    // Show stats
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE listing_status = 'disabled') as disabled,
        COUNT(*) as total
      FROM businesses
    `;
    console.log(`\n📊 All ${stats[0].total} businesses defaulted to 'disabled'`);
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
  }
}

addListingStatus();
