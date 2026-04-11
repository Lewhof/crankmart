import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get business
    const result = await db.execute(
      sql.raw(`
        SELECT 
          id, name, slug, business_type, province, city, address,
          location_lat, location_lng, logo_url, cover_url,
          description, website, email, phone, whatsapp,
          brands_stocked, services, is_verified, is_premium, 
          rating, review_count, views_count, created_at
        FROM businesses
        WHERE slug = '${slug.replace(/'/g, "''")}'
        LIMIT 1
      `)
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    const business = result.rows[0] as any;

    // Get related businesses (same type, same province, excluding current)
    const relatedResult = await db.execute(
      sql.raw(`
        SELECT 
          id, name, slug, business_type, province, city, 
          logo_url, description, is_verified, is_premium
        FROM businesses
        WHERE business_type = '${business.business_type}' 
          AND province = '${business.province}'
          AND slug != '${slug.replace(/'/g, "''")}'
        ORDER BY is_premium DESC, is_verified DESC, name ASC
        LIMIT 4
      `)
    );

    // Increment views count
    await db.execute(
      sql.raw(`
        UPDATE businesses 
        SET views_count = views_count + 1 
        WHERE slug = '${slug.replace(/'/g, "''")}'
      `)
    );

    return NextResponse.json({
      success: true,
      data: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        type: business.business_type,
        province: business.province,
        city: business.city,
        address: business.address,
        location: {
          lat: business.location_lat,
          lng: business.location_lng,
        },
        logo: business.logo_url,
        banner: business.cover_url,
        description: business.description,
        website: business.website,
        email: business.email,
        phone: business.phone,
        whatsapp: business.whatsapp,
        brands: business.brands_stocked || [],
        services: business.services || [],
        verified: business.is_verified,
        featured: business.is_premium,
        rating: business.rating || 0,
        reviews: business.review_count || 0,
        views: business.views_count + 1,
        createdAt: business.created_at,
      },
      related: relatedResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.business_type,
        city: row.city,
        logo: row.logo_url,
        description: row.description,
        verified: row.is_verified,
        featured: row.is_premium,
      })),
    });
  } catch (error) {
    console.error("Directory detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch business details" },
      { status: 500 }
    );
  }
}
