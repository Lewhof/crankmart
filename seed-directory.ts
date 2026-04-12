/**
 * CrankMart Business Directory Seed Script
 * Seeds 108 SA cycling businesses (all disabled at launch)
 * Source: /home/hein/.openclaw/workspace/crankmart/data/business-directory-db.json
 */

import { db } from './src/db'
import { businesses } from './src/db/schema'
import fs from 'fs/promises'
import path from 'path'

interface SeedBusiness {
  id: string
  name: string
  slug: string
  categories: string[]
  province: string
  city: string
  suburb?: string
  address: string
  website?: string
  phone?: string
  whatsapp?: string
  email?: string
  description: string
  services?: string[]
  brands_stocked?: string[]
  specialisation?: string[]
  status: string
  tier: string
  verified: boolean
  seo_tags?: string[]
}

interface SeedData {
  meta: {
    version: string
    generated: string
    total_listings: number
    status: string
  }
  businesses: SeedBusiness[]
}

// Map seed categories to our business_type enum
const mapCategoryToType = (categories: string[]): 'shop' | 'brand' | 'service_center' | 'tour_operator' | 'event_organiser' => {
  if (categories.includes('bike_shop')) return 'shop'
  if (categories.includes('brand_importer')) return 'brand'
  if (categories.includes('mechanic_workshop')) return 'service_center'
  if (categories.includes('bike_hire')) return 'tour_operator'
  if (categories.includes('event_organiser')) return 'event_organiser'
  return 'shop' // default
}

// Map seed status to our enum
const mapStatus = (status: string): 'pending' | 'verified' | 'suspended' | 'claimed' | 'removed' => {
  if (status === 'active' || status === 'verified') return 'verified'
  if (status === 'claimed') return 'claimed'
  if (status === 'suspended' || status === 'paused') return 'suspended'
  if (status === 'removed') return 'removed'
  return 'pending'
}

async function main() {
  console.log('🔍 Loading seed data from JSON...')
  
  const seedPath = '/home/hein/.openclaw/workspace/crankmart/data/business-directory-db.json'
  let fileContent = await fs.readFile(seedPath, 'utf-8')
  
  // Strip comments from JSON (lines starting with //)
  fileContent = fileContent
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n')
  
  const seedData: SeedData = JSON.parse(fileContent)

  console.log(`📊 Found ${seedData.businesses.length} businesses to seed`)
  console.log(`📌 Status: ${seedData.meta.status}`)
  console.log(`📅 Generated: ${seedData.meta.generated}`)

  let inserted = 0
  let skipped = 0

  for (const business of seedData.businesses) {
    try {
      // Check if already exists
      const existing = await db.query.businesses.findFirst({
        where: (businesses, { eq }) => eq(businesses.slug, business.slug)
      })

      if (existing) {
        console.log(`⏭️  Skipping ${business.name} (already exists)`)
        skipped++
        continue
      }

      await db.insert(businesses).values({
        name: business.name,
        slug: business.slug,
        businessType: mapCategoryToType(business.categories),
        description: business.description,
        province: business.province,
        city: business.city,
        suburb: business.suburb || null,
        address: business.address,
        phone: business.phone || null,
        whatsapp: business.whatsapp || null,
        email: business.email || null,
        website: business.website || null,
        brandsStocked: business.brands_stocked || [],
        services: business.services || [],
        specialisation: business.specialisation || [],
        seoTags: business.seo_tags || [],
        status: mapStatus(business.status),
        verified: business.verified,
        isPremium: false, // All start as free tier
        tier: business.tier || 'free',
        viewsCount: 0,
        savesCount: 0,
        // No logo/banner for now - will be added via outreach
        logoUrl: null,
        bannerUrl: null,
        // No lat/lng for now - will be geocoded later
        locationLat: null,
        locationLng: null,
      })

      console.log(`✅ Inserted: ${business.name} (${business.city}, ${business.province})`)
      inserted++
    } catch (error) {
      console.error(`❌ Failed to insert ${business.name}:`, error)
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log(`✅ Inserted: ${inserted}`)
  console.log(`⏭️  Skipped:  ${skipped}`)
  console.log(`📊 Total:    ${seedData.businesses.length}`)
  console.log('═══════════════════════════════════════\n')
  console.log('🚀 Seed complete! All listings are DISABLED by default.')
  console.log('📧 Ready for outreach campaign.')
}

main()
  .then(() => {
    console.log('✅ Done')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
