import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position`
    console.log('Events table columns:')
    result.forEach((col: any) => {
      console.log(`  ${col.column_name}: ${col.data_type}`)
    })
  } catch (err) {
    console.error('Error:', err)
  }

  process.exit(0)
}

main()
