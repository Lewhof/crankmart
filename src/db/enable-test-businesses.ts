/**
 * Enable 10 test businesses for directory testing
 * Run: DATABASE_URL="..." npx tsx src/db/enable-test-businesses.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function enableTestBusinesses() {
  console.log(`\n🧪 Enabling 10 test businesses for directory testing\n`);

  try {
    // Enable 10 businesses (mix of types and cities)
    const result = await sql`
      UPDATE businesses
      SET listing_status = 'active'
      WHERE id IN (
        SELECT id FROM businesses
        WHERE listing_status = 'disabled'
        ORDER BY name
        LIMIT 10
      )
      RETURNING name, slug, business_type, city
    `;

    console.log(`✅ Enabled ${result.length} businesses:\n`);
    result.forEach((b: any) => {
      console.log(`   • ${b.name} (${b.business_type}) — ${b.city}`);
    });

    // Show total active
    const countResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE listing_status = 'active') as active,
        COUNT(*) FILTER (WHERE listing_status = 'disabled') as disabled,
        COUNT(*) as total
      FROM businesses
    `;
    const counts = countResult[0] as any;
    console.log(`\n📊 Directory stats:`);
    console.log(`   Active: ${counts.active}`);
    console.log(`   Disabled: ${counts.disabled}`);
    console.log(`   Total: ${counts.total}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

enableTestBusinesses();
