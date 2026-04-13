import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function migrateSearch() {
  try {
    console.log('Starting search migration...')

    // Add search_vector column
    console.log('Adding search_vector column...')
    await sql.query(`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `)

    // Populate search_vector for existing rows
    console.log('Populating search_vector for existing listings...')
    await sql.query(`
      UPDATE listings 
      SET search_vector = to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(bike_make, '') || ' ' ||
        coalesce(bike_model, '') || ' ' ||
        coalesce(colour, '')
      )
      WHERE search_vector IS NULL;
    `)

    // Create GIN index for fast search
    console.log('Creating GIN index...')
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN(search_vector);
    `)

    // Create function to keep search_vector updated
    console.log('Creating trigger function...')
    await sql.query(`
      CREATE OR REPLACE FUNCTION listings_search_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english',
          coalesce(NEW.title, '') || ' ' ||
          coalesce(NEW.description, '') || ' ' ||
          coalesce(NEW.bike_make, '') || ' ' ||
          coalesce(NEW.bike_model, '') || ' ' ||
          coalesce(NEW.colour, '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create trigger
    console.log('Creating trigger...')
    await sql.query(`
      DROP TRIGGER IF EXISTS listings_search_trigger ON listings;
    `)
    await sql.query(`
      CREATE TRIGGER listings_search_trigger
        BEFORE INSERT OR UPDATE ON listings
        FOR EACH ROW EXECUTE FUNCTION listings_search_update();
    `)

    console.log('✅ Search migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateSearch()
