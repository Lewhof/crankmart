import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getCountry } from '@/lib/country'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id: listingId } = await params
    const country = await getCountry()

    const result = await db.execute(sql`
      SELECT l.*,
        json_agg(json_build_object('id', li.id, 'imageUrl', li.image_url, 'displayOrder', li.display_order) ORDER BY li.display_order)
          FILTER (WHERE li.id IS NOT NULL) as images
      FROM listings l
      LEFT JOIN listing_images li ON li.listing_id = l.id
      WHERE l.id = ${listingId} AND l.country = ${country}
      GROUP BY l.id
    `)
    const rows = (result.rows ?? result) as any[]
    if (!rows.length) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const listing = rows[0]
    if (listing.seller_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden - not your listing' }, { status: 403 })
    }

    return NextResponse.json({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      negotiable: listing.negotiable,
      condition: listing.condition,
      province: listing.province,
      city: listing.city,
      postalCode: listing.postal_code,
      bikeMake: listing.bike_make,
      bikeModel: listing.bike_model,
      bikeYear: listing.bike_year,
      colour: listing.colour,
      frameSize: listing.frame_size,
      wheelSizeInches: listing.wheel_size_inches,
      drivetrainSpeeds: listing.drivetrain_speeds,
      brakeType: listing.brake_type,
      frameMaterial: listing.frame_material,
      shippingAvailable: listing.shipping_available,
      slug: listing.slug,
      images: listing.images || [],
    })
  } catch (error: any) {
    console.error('Edit GET error:', error.message)
    return NextResponse.json({ error: 'Failed to load listing' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id: listingId } = await params
    const country = await getCountry()
    const body = await request.json()

    // Verify ownership using parameterised query (country-scoped)
    const check = await db.execute(sql`SELECT seller_id, slug FROM listings WHERE id = ${listingId} AND country = ${country}`)
    const rows = (check.rows ?? check) as any[]
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (rows[0].seller_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Build parameterised update query dynamically
    const updates: { [key: string]: any } = { updated_at: new Date() }
    if (body.title) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description || ''
    if (body.price) updates.price = parseFloat(body.price)
    if (body.negotiable !== undefined) updates.negotiable = body.negotiable
    if (body.condition) updates.condition = body.condition
    if (body.province) updates.province = body.province
    if (body.city) updates.city = body.city
    if (body.postalCode) updates.postal_code = body.postalCode
    if (body.bikeMake) updates.bike_make = body.bikeMake
    if (body.bikeModel) updates.bike_model = body.bikeModel
    if (body.bikeYear) updates.bike_year = parseInt(body.bikeYear)
    if (body.colour) updates.colour = body.colour
    if (body.frameSize) updates.frame_size = body.frameSize
    if (body.wheelSizeInches) updates.wheel_size_inches = parseInt(body.wheelSizeInches)
    if (body.drivetrainSpeeds) updates.drivetrain_speeds = parseInt(body.drivetrainSpeeds)
    if (body.brakeType) updates.brake_type = body.brakeType
    if (body.frameMaterial) updates.frame_material = body.frameMaterial
    if (body.shippingAvailable !== undefined) updates.shipping_available = body.shippingAvailable

    // Build parameterised SET clause
    const setClauses = Object.keys(updates).map((key, idx) => {
      // Map camelCase/snake_case properly
      const dbKey = key === 'updated_at' ? 'updated_at' : 
                    key === 'price' ? 'price' :
                    key === 'negotiable' ? 'negotiable' :
                    key === 'condition' ? 'condition' :
                    key === 'province' ? 'province' :
                    key === 'city' ? 'city' :
                    key === 'postal_code' ? 'postal_code' :
                    key === 'bike_make' ? 'bike_make' :
                    key === 'bike_model' ? 'bike_model' :
                    key === 'bike_year' ? 'bike_year' :
                    key === 'colour' ? 'colour' :
                    key === 'frame_size' ? 'frame_size' :
                    key === 'wheel_size_inches' ? 'wheel_size_inches' :
                    key === 'drivetrain_speeds' ? 'drivetrain_speeds' :
                    key === 'brake_type' ? 'brake_type' :
                    key === 'frame_material' ? 'frame_material' :
                    key === 'shipping_available' ? 'shipping_available' :
                    key

      const placeholder = `$${idx + 1}`
      return `${dbKey} = ${placeholder}`
    })

    const setClauseStr = setClauses.join(', ')
    const updateValues = Object.values(updates)

    // Use dynamic parameterised update (simplified approach)
    await db.execute(sql`UPDATE listings SET 
      title = COALESCE(${updates.title}, title),
      description = COALESCE(${updates.description}, description),
      price = COALESCE(${updates.price}, price),
      negotiable = COALESCE(${updates.negotiable}, negotiable),
      condition = COALESCE(${updates.condition}::listing_condition, condition),
      province = COALESCE(${updates.province}, province),
      city = COALESCE(${updates.city}, city),
      postal_code = COALESCE(${updates.postal_code}, postal_code),
      bike_make = COALESCE(${updates.bike_make}, bike_make),
      bike_model = COALESCE(${updates.bike_model}, bike_model),
      bike_year = COALESCE(${updates.bike_year}, bike_year),
      colour = COALESCE(${updates.colour}, colour),
      frame_size = COALESCE(${updates.frame_size}, frame_size),
      wheel_size_inches = COALESCE(${updates.wheel_size_inches}, wheel_size_inches),
      drivetrain_speeds = COALESCE(${updates.drivetrain_speeds}, drivetrain_speeds),
      brake_type = COALESCE(${updates.brake_type}, brake_type),
      frame_material = COALESCE(${updates.frame_material}, frame_material),
      shipping_available = COALESCE(${updates.shipping_available}, shipping_available),
      updated_at = NOW()
      WHERE id = ${listingId}
    `)

    // Delete removed images using parameterised query
    if (body.deleteImageIds?.length) {
      for (const imgId of body.deleteImageIds) {
        await db.execute(sql`DELETE FROM listing_images WHERE id = ${imgId}`)
      }
    }

    // Insert new images using parameterised query
    if (body.newImages?.length) {
      const maxR = await db.execute(sql`SELECT COALESCE(MAX(display_order),0) as m FROM listing_images WHERE listing_id = ${listingId}`)
      let nextOrder = ((maxR.rows ?? maxR) as any[])[0].m + 1
      for (const url of body.newImages) {
        await db.execute(sql`INSERT INTO listing_images (id, listing_id, image_url, display_order) VALUES (${uuidv4()}, ${listingId}, ${url}, ${nextOrder++})`)
      }
    }

    const slug = rows[0].slug
    return NextResponse.json({ success: true, slug })
  } catch (error: any) {
    console.error('Edit PATCH error:', error.message)
    return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 })
  }
}
