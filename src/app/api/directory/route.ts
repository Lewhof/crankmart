import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Query parameters
    const type = searchParams.get("type");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (type) {
      whereClause += " AND business_type = $" + (params.length + 1);
      params.push(type);
    }

    if (province) {
      whereClause += " AND province = $" + (params.length + 1);
      params.push(province);
    }

    if (city) {
      whereClause += " AND city = $" + (params.length + 1);
      params.push(city);
    }

    if (featured) {
      whereClause += " AND is_premium = true";
    }

    if (search) {
      whereClause += " AND (name ILIKE $" + (params.length + 1) + " OR description ILIKE $" + (params.length + 2) + ")";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM businesses ${whereClause}`;
    const countResult = await db.execute(sql.raw(countQuery.replace(/\$/g, (match, offset) => {
      const paramIndex = parseInt(countQuery.substring(offset).match(/\d+/)?.[0] || "1");
      return `'${params[paramIndex - 1]}'`;
    })));
    const total = (countResult.rows[0] as any)?.count || 0;

    // Get paginated results
    const query = `
      SELECT 
        id, name, slug, business_type, province, city, 
        logo_url, cover_url, description, website, email, phone,
        brands_stocked, services, is_verified, is_premium, views_count
      FROM businesses
      ${whereClause}
      ORDER BY is_premium DESC, is_verified DESC, name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await db.execute(
      sql.raw(
        `SELECT 
          id, name, slug, business_type, province, city, 
          logo_url, cover_url, description, website, email, phone,
          brands_stocked, services, is_verified, is_premium, views_count
        FROM businesses
        ${whereClause}
        ORDER BY is_premium DESC, is_verified DESC, name ASC
        LIMIT ${limit} OFFSET ${offset}`
      )
    );

    const businesses = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.business_type,
      province: row.province,
      city: row.city,
      logo: row.logo_url,
      cover: row.cover_url || null,
      description: row.description,
      website: row.website,
      email: row.email,
      phone: row.phone,
      brands: row.brands_stocked || [],
      services: row.services || [],
      verified: row.is_verified,
      featured: row.is_premium,
      views: row.views_count || 0,
    }));

    return NextResponse.json({
      success: true,
      data: businesses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Directory API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
