import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  const counts = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE listing_status = 'active') as active,
      COUNT(*) FILTER (WHERE listing_status = 'disabled') as disabled,
      COUNT(*) as total
    FROM businesses
  `;
  console.log('Before:', JSON.stringify(counts[0]));

  const result = await sql`
    UPDATE businesses 
    SET listing_status = 'active' 
    WHERE listing_status != 'active' OR listing_status IS NULL
    RETURNING id
  `;
  console.log('Activated:', result.length, 'businesses');

  const after = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE listing_status = 'active') as active,
      COUNT(*) as total
    FROM businesses
  `;
  console.log('After:', JSON.stringify(after[0]));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
