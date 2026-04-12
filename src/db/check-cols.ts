import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'businesses' 
    ORDER BY ordinal_position
  `;
  cols.forEach((c: any) => console.log(c.column_name + ' (' + c.data_type + ')'));
}
main().catch(console.error);
