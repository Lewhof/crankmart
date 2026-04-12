import { neon } from "@neondatabase/serverless";
import * as fs from "fs";

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("\n🔧 Running migration: add business status column\n");
  
  try {
    const migrationSQL = fs.readFileSync(
      "/home/hein/Workspace/cyclemart/drizzle/0005_add_business_status.sql",
      "utf-8"
    );
    
    // Split and execute each statement
    const statements = migrationSQL.split(";").filter((s) => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await sql.query(stmt)
      }
    }
    
    console.log("✅ Migration complete\n");
    
    // Verify
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'businesses' AND column_name = 'status'
    `;
    
    if (result.length > 0) {
      console.log(`✓ Verified: status column added (${result[0].data_type})`);
    } else {
      console.log("⚠ Warning: status column not found after migration");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
