import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  // Check if categories column exists
  const hasCats = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name='businesses' AND column_name='categories'
  `;
  console.log('Has categories col:', hasCats.length > 0);

  // Get event organisers - try different approaches
  const rows = await sql`
    SELECT name, slug, logo_url, cover_url, website, business_type
    FROM businesses 
    WHERE business_type::text IN ('event_organiser', 'event_manager')
       OR name ILIKE '%sani2c%' OR name ILIKE '%cape epic%' OR name ILIKE '%pioneer%'
       OR name ILIKE '%dryland%' OR name ILIKE '%trailseeker%' OR name ILIKE '%munga%'
       OR name ILIKE '%ronde%' OR name ILIKE '%pedal power%' OR name ILIKE '%cycletour%'
       OR name ILIKE '%99er%' OR name ILIKE '%gallows%' OR name ILIKE '%gravduro%'
    ORDER BY name
  `;
  console.log('\nEvent-related businesses found:', rows.length);
  let withLogo = 0, withCover = 0;
  rows.forEach((r: any) => {
    if (r.logo_url) withLogo++;
    if (r.cover_url) withCover++;
    console.log(r.name + ' [' + r.business_type + ']');
    console.log('  logo: ' + (r.logo_url || 'NULL'));
    console.log('  cover: ' + (r.cover_url || 'NULL'));
  });
  console.log('\nWith logo: ' + withLogo + '/' + rows.length);
  console.log('With cover: ' + withCover + '/' + rows.length);

  // Also show all distinct business_type values
  const types = await sql`SELECT DISTINCT business_type FROM businesses ORDER BY business_type`;
  console.log('\nAll business types:', types.map((t:any) => t.business_type).join(', '));
}
main().catch(console.error);
