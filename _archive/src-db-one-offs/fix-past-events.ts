import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  // Mark events with past end dates as completed
  const updated = await sql`
    UPDATE events 
    SET status = 'completed', updated_at = NOW()
    WHERE event_date_end < NOW()::date
    AND status = 'upcoming'
    RETURNING title, event_date_end
  ` as any[];
  console.log(`Marked ${updated.length} past events as completed:`);
  updated.forEach((r: any) => console.log(` - ${r.title} (${r.event_date_end?.toString().substring(0,10)})`));
  
  const remaining = await sql`SELECT COUNT(*) as c FROM events WHERE status='upcoming'` as any[];
  console.log(`\nRemaining upcoming: ${remaining[0].c}`);
}
main().catch(console.error);
