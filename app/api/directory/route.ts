import { NextRequest, NextResponse } from "next/server";
import { sql, SQL } from "drizzle-orm";
import { db } from "@/db";

// Helper: join SQL conditions with AND and prepend WHERE
// NOTE: We avoid nesting sql`WHERE ${fragment}` inside another sql template
// because Drizzle ORM loses the static prefix when the fragment is re-embedded.
// Instead we build the full string using sql.raw for the keyword + sql.join for conditions.
function buildWhere(conditions: SQL[]): SQL {
  if (conditions.length === 0) return sql``
  return sql`${sql.raw('WHERE')} ${sql.join(conditions, sql` AND `)}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const type      = searchParams.get("type");
    const province  = searchParams.get("province");
    const city      = searchParams.get("city");
    const search    = searchParams.get("search");
    const featured  = searchParams.get("featured") === "true";
    const limit     = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
    const page      = Math.max(parseInt(searchParams.get("page")  || "1"),  1);
    const offset    = (page - 1) * limit;

    // Near Me params
    const userLat   = parseFloat(searchParams.get("lat")      || "");
    const userLng   = parseFloat(searchParams.get("lng")      || "");
    const nearbyKm  = parseInt(searchParams.get("nearbyKm")   || "0");
    const hasProximity = !isNaN(userLat) && !isNaN(userLng) && nearbyKm > 0;

    const conditions: SQL[] = [];
    // Show verified and claimed businesses (hide pending/suspended/removed)
    conditions.push(sql`status IN ('verified', 'claimed')`);
    // Exclude event_organiser from the default directory (shops) view
    // unless explicitly requested (e.g. Events page Organisers tab)
    if (type) {
      conditions.push(sql`business_type = ${type}`);
    } else {
      conditions.push(sql`business_type != 'event_organiser'`);
    }
    if (province) conditions.push(sql`province = ${province}`);
    if (city)     conditions.push(sql`city = ${city}`);
    if (featured) conditions.push(sql`is_premium = true`);
    if (search) {
      const term = `%${search}%`;
      conditions.push(sql`(name ILIKE ${term} OR description ILIKE ${term})`);
    }
    if (hasProximity) {
      const distFormula = sql`(6371 * acos(LEAST(1.0, cos(radians(${userLat})) * cos(radians(location_lat::float)) * cos(radians(location_lng::float) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(location_lat::float)))))`;
      conditions.push(sql`location_lat IS NOT NULL AND location_lng IS NOT NULL AND ${distFormula} <= ${nearbyKm}`);
    }

    const whereSql = buildWhere(conditions);

    // Count
    const countResult = await db.execute(
      sql`SELECT COUNT(*) AS count FROM businesses ${whereSql}`
    );
    const total = parseInt((countResult.rows[0] as any)?.count ?? "0", 10);

    // Data
    const distSelectSql = hasProximity
      ? sql`, (6371 * acos(LEAST(1.0, cos(radians(${userLat})) * cos(radians(location_lat::float)) * cos(radians(location_lng::float) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(location_lat::float))))) AS distance_from_user`
      : sql``;
    const orderBySql = hasProximity
      ? sql`ORDER BY distance_from_user ASC`
      : sql`ORDER BY is_premium DESC, verified DESC, name ASC`;

    const dataResult = await db.execute(
      sql`
        SELECT
          id, name, slug, business_type, province, city,
          logo_url, banner_url, description, website, email, phone, whatsapp,
          brands_stocked, services, verified, is_premium, views_count,
          location_lat, location_lng${distSelectSql}
        FROM businesses
        ${whereSql}
        ${orderBySql}
        LIMIT ${limit} OFFSET ${offset}
      `
    );

    const businesses = dataResult.rows.map((row: any) => ({
      id:          row.id,
      name:        row.name,
      slug:        row.slug,
      type:        row.business_type,
      province:    row.province,
      city:        row.city,
      logo:        row.logo_url   || null,
      cover:       row.banner_url || null,
      description: row.description,
      website:     row.website,
      email:       row.email,
      phone:       row.phone,
      whatsapp:    row.whatsapp,
      brands:      row.brands_stocked || [],
      services:    row.services       || [],
      verified:    row.verified,
      featured:    row.is_premium,
      views:       row.views_count    || 0,
      lat:                row.location_lat       ? parseFloat(row.location_lat)       : null,
      lng:                row.location_lng       ? parseFloat(row.location_lng)       : null,
      distance_from_user: row.distance_from_user ? parseFloat(row.distance_from_user) : null,
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
