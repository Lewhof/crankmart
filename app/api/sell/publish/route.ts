import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { listings, listingImages, listingCategories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { randomBytes } from 'crypto'
import { sendEmail, listingPublishedEmail } from '@/lib/email'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

function randomSuffix(): string {
  return randomBytes(4).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      category,
      title,
      description,
      bikeMake,
      bikeModel,
      bikeYear,
      condition,
      price,
      negotiable,
      province,
      city,
      postalCode,
      shippingAvailable,
      frameSize,
      wheelSizeInches,
      suspensionTravelMm,
      frameMaterial,
      drivetrainSpeeds,
      brakeType,
      componentBrands,
      damageNotes,
      colour,
      images,
      forceDuplicate,
      // Extended step-2 attributes
      groupset, forkBrand, rearShockBrand, wheels, tyres, handlebar,
      stem, seatpost, saddle, pedalType, shifters, crank, chain, cassette, extras,
      motorBrand, batteryCapacity, ebikeRange,
      suspBrand, axleStandard, brakeStandard, drivetrainBrand,
      gpsBrand, apparelSize, gender, kidsWheelSize, kidsAge,
      helmetSize, shoeSize, recentUpgrades,
    } = body

    // Build attributes object — all optional fields that don't have their own column
    const attributes: Record<string, string> = {}
    const attrFields: Record<string, string | undefined> = {
      groupset, forkBrand, rearShockBrand, wheels, tyres, handlebar,
      stem, seatpost, saddle, pedalType, shifters, crank, chain, cassette, extras,
      motorBrand, batteryCapacity, ebikeRange,
      suspBrand, axleStandard, brakeStandard, drivetrainBrand,
      gpsBrand, apparelSize, gender, kidsWheelSize, kidsAge,
      helmetSize, shoeSize, recentUpgrades,
      // Also mirror top-level fields into attributes for unified spec table display
      frameSize, frameMaterial, colour,
      ...(wheelSizeInches ? { wheelSize: String(wheelSizeInches) } : {}),
      ...(suspensionTravelMm ? { suspensionTravel: String(suspensionTravelMm) } : {}),
      ...(drivetrainSpeeds ? { drivetrainSpeeds: String(drivetrainSpeeds) } : {}),
      ...(brakeType ? { brakeType } : {}),
    }
    for (const [key, val] of Object.entries(attrFields)) {
      if (val && String(val).trim()) attributes[key] = String(val).trim()
    }

    if (!title || !price || !condition || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate listing (if not forced)
    if (!forceDuplicate) {
      const userId = session.user?.id as string
      const existingListing = await db
        .select({ id: listings.id, title: listings.title, slug: listings.slug })
        .from(listings)
        .where(
          eq(listings.sellerId, userId)
        )
        .limit(10)

      // Check for similar title using case-insensitive substring match
      const titleLower = title.toLowerCase()
      const duplicate = existingListing.find(
        (l) =>
          l.title.toLowerCase().includes(titleLower.substring(0, 25)) ||
          titleLower.includes(l.title.toLowerCase().substring(0, 25))
      )

      if (duplicate) {
        return NextResponse.json(
          {
            error: 'Similar listing exists',
            duplicate: true,
            existingSlug: duplicate.slug,
            existingTitle: duplicate.title,
          },
          { status: 409 }
        )
      }
    }

    // Get category ID
    const [categoryRecord] = await db
      .select()
      .from(listingCategories)
      .where(eq(listingCategories.slug, category))
      .limit(1)

    if (!categoryRecord) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Generate slug
    const baseSlug = slugify(title)
    const slug = `${baseSlug}-${randomSuffix()}`

    // Create listing
    const listingId = uuidv4()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    
    await db.insert(listings).values({
      id: listingId,
      sellerId: session.user.id as string,
      categoryId: categoryRecord.id,
      title: title.slice(0, 255),
      slug,
      description: description || '',
      bikeMake: bikeMake || null,
      bikeModel: bikeModel || null,
      bikeYear: bikeYear ? parseInt(bikeYear) : null,
      condition: condition as any,
      price: price.toString(),
      negotiable: negotiable ?? true,
      province: province || null,
      city: city || null,
      postalCode: postalCode || null,
      shippingAvailable: shippingAvailable ?? false,
      frameSize: frameSize || null,
      wheelSizeInches: wheelSizeInches ? parseInt(wheelSizeInches) : null,
      suspensionTravelMm: suspensionTravelMm ? parseInt(suspensionTravelMm) : null,
      frameMaterial: frameMaterial || null,
      drivetrainSpeeds: drivetrainSpeeds ? parseInt(drivetrainSpeeds) : null,
      brakeType: brakeType || null,
      componentBrands: componentBrands || null,
      damageNotes: damageNotes || null,
      colour: colour || null,
      attributes: Object.keys(attributes).length > 0 ? attributes : {},
      expiresAt,
      status: 'active' as const,
      moderationStatus: 'pending' as const,
    })

    // Add images
    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((url: string, idx: number) => ({
        id: uuidv4(),
        listingId,
        imageUrl: url,
        displayOrder: idx,
      }))
      await db.insert(listingImages).values(imageRecords)
    }

    // Email seller confirmation — fire and forget
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crankmart.com'
      await sendEmail({
        to: session.user.email as string,
        subject: `Your listing "${title}" is live on CrankMart 🎉`,
        html: listingPublishedEmail({
          sellerName: session.user.name || 'there',
          listingTitle: title,
          listingUrl: `${baseUrl}/browse/${slug}`,
        }),
      })
    } catch (emailErr) {
      console.error('Publish email failed (non-fatal):', emailErr)
    }

    return NextResponse.json({
      slug,
      listingId,
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish' },
      { status: 500 }
    )
  }
}
