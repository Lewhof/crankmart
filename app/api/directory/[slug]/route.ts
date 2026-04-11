import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Get business (only show active businesses)
    const result = await db.execute(
      sql`
        SELECT *
        FROM businesses
        WHERE slug = ${slug}
        LIMIT 1
      `
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Business not found" },
        { status: 404 }
      );
    }

    const business = result.rows[0] as any;

    // Get related businesses (same type, same province, excluding current, only active)
    const relatedResult = await db.execute(
      sql`
        SELECT id, name, slug, business_type, province, city, logo_url, description, is_verified, is_premium
        FROM businesses
        WHERE business_type = ${business.business_type}
          AND province = ${business.province}
          AND slug != ${slug}
        ORDER BY is_premium DESC, is_verified DESC, name ASC
        LIMIT 4
      `
    );

    // Increment views count
    await db.execute(
      sql`
        UPDATE businesses
        SET views_count = views_count + 1
        WHERE slug = ${slug}
      `
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
        banner: business.cover_url || business.banner_url || null,
        description: business.description,
        website: business.website,
        email: business.email,
        phone: business.phone,
        whatsapp: business.whatsapp,
        brands: business.brands_stocked || [],
        services: business.services || [],
        verified: business.is_verified ?? business.verified ?? false,
        featured: business.is_premium,
        opening_year: business.opening_year || null,
        hours_json: business.hours_json || null,
        rating: business.rating || 0,
        reviews: business.review_count || 0,
        views: (business.views_count || 0) + 1,
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
        verified: row.is_verified ?? row.verified ?? false,
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
