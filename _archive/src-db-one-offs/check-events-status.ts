import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const total = await sql`SELECT COUNT(*) as c FROM events` as any[];
  const upcoming = await sql`SELECT COUNT(*) as c FROM events WHERE status = 'upcoming'` as any[];
  const byStatus = await sql`SELECT status, COUNT(*) as c FROM events GROUP BY status ORDER BY c DESC` as any[];
  console.log('Total events in DB:', total[0].c);
  console.log('Status=upcoming:', upcoming[0].c);
  console.log('\nAll statuses:');
  byStatus.forEach((r: any) => console.log(` ${r.status}: ${r.c}`));
  
  // Check the API WHERE clause - it filters by status='upcoming'
  // But also check event_date_start — past events may be filtered
  const pastEvents = await sql`SELECT COUNT(*) as c FROM events WHERE event_date_start < NOW() AND status = 'upcoming'` as any[];
  console.log('\nUpcoming status but past date:', pastEvents[0].c);
}
main().catch(console.error);
