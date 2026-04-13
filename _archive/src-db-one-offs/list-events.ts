import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT name, slug FROM businesses WHERE business_type = 'event_organiser' ORDER BY name` as any[];
  rows.forEach((r: any) => console.log(r.name + ' | ' + r.slug));
}
main().catch(console.error);
