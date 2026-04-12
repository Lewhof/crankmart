// Load .env.local before any imports
import { readFileSync } from 'fs'
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  })
} catch {}

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log('Cleaning generic/non-specific images...\n')

  // 1. Delete all images where source = 'unsplash'
  const unsplashResult = await sql`
    DELETE FROM route_images
    WHERE source = 'unsplash'
    RETURNING id
  `
  const unsplashDeleted = unsplashResult.length

  // 2. Delete all images where source = 'mtbtrailssa' AND url contains 'unsplash.com'
  const mtbUnsplashResult = await sql`
    DELETE FROM route_images
    WHERE source = 'mtbtrailssa' AND url ILIKE '%unsplash.com%'
    RETURNING id
  `
  const mtbUnsplashDeleted = mtbUnsplashResult.length

  const totalDeleted = unsplashDeleted + mtbUnsplashDeleted
  console.log(`Deleted ${unsplashDeleted} unsplash-sourced images`)
  console.log(`Deleted ${mtbUnsplashDeleted} mtbtrailssa/unsplash images`)
  console.log(`Total deleted: ${totalDeleted}`)

  // 3. For routes that now have 0 images, clear hero/primary image URLs
  const zeroImagesResult = await sql`
    UPDATE routes
    SET hero_image_url = NULL, primary_image_url = NULL, image_count = 0
    WHERE id NOT IN (SELECT DISTINCT route_id FROM route_images)
    AND (hero_image_url IS NOT NULL OR primary_image_url IS NOT NULL OR image_count > 0)
    RETURNING id
  `
  const routesClearedImages = zeroImagesResult.length
  console.log(`\nRoutes now with 0 images (hero/primary cleared): ${routesClearedImages}`)

  // 4. Update image_count for all routes
  await sql`
    UPDATE routes
    SET image_count = (
      SELECT COUNT(*) FROM route_images WHERE route_id = routes.id
    )
  `
  console.log('Updated image_count for all routes')

  // 5. Summary: how many routes have 0 images total
  const zeroCountResult = await sql`
    SELECT COUNT(*) as count FROM routes WHERE image_count = 0
  `
  const routesWithZero = (zeroCountResult[0] as any).count

  console.log(`\n--- SUMMARY ---`)
  console.log(`Images deleted: ${totalDeleted}`)
  console.log(`  - Source 'unsplash': ${unsplashDeleted}`)
  console.log(`  - Source 'mtbtrailssa' + unsplash URL: ${mtbUnsplashDeleted}`)
  console.log(`Routes now with 0 images: ${routesWithZero}`)
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
