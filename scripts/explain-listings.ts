import { neon } from '@neondatabase/serverless'

type ExplainRow = { 'QUERY PLAN': string }

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  console.log('--- Listings main query (typical /browse) ---')
  const r1 = (await sql.query(`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
    SELECT * FROM listings
    WHERE country = $1
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY boost_enabled DESC, created_at DESC
    LIMIT 24 OFFSET 0
  `, ['za'])) as ExplainRow[]
  console.log(r1.map(r => r['QUERY PLAN']).join('\n'))

  console.log('\n--- Image fetch for top 24 ---')
  const r2 = (await sql.query(`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
    SELECT DISTINCT ON (listing_id) listing_id, image_url, thumb_url, display_order
    FROM listing_images
    WHERE listing_id IN (
      SELECT id FROM listings
      WHERE country = $1 AND status = 'active'
      ORDER BY boost_enabled DESC, created_at DESC
      LIMIT 24
    )
    ORDER BY listing_id, display_order ASC
  `, ['za'])) as ExplainRow[]
  console.log(r2.map(r => r['QUERY PLAN']).join('\n'))

  console.log('\n--- Indexes on listings table ---')
  const idx = (await sql.query(`
    SELECT indexname, indexdef
    FROM pg_indexes WHERE tablename = 'listings'
    ORDER BY indexname
  `)) as Array<{ indexname: string, indexdef: string }>
  idx.forEach(i => console.log(`  ${i.indexname}\n    ${i.indexdef}`))

  console.log('\n--- Row count ---')
  const cnt = (await sql.query(`SELECT COUNT(*)::int AS n FROM listings WHERE country = 'za' AND status = 'active'`)) as Array<{ n: number }>
  console.log('Active ZA listings:', cnt[0].n)
}
main().catch(e => { console.error(e); process.exit(1) })
