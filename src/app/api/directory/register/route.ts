import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode, name, website_url, contact_email, ...formData } = body;

    if (mode === "concierge") {
      // Concierge mode: simple 3-field form
      if (!name || !website_url || !contact_email) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const result = await db.execute(
        sql.raw(`
          INSERT INTO businesses (name, slug, website, email, owner_id, is_premium)
          VALUES (
            '${name.replace(/'/g, "''")}',
            '${slug}',
            '${website_url.replace(/'/g, "''")}',
            '${contact_email.replace(/'/g, "''")}',
            '${session.user.id}',
            false
          )
          RETURNING id, slug
        `)
      );

      return NextResponse.json({
        success: true,
        message: "Concierge request submitted successfully",
        data: {
          id: (result.rows[0] as any).id,
          slug: (result.rows[0] as any).slug,
        },
      });
    } else if (mode === "self") {
      // Self-serve mode: full form
      const {
        business_type,
        province,
        city,
        address,
        phone,
        description,
        services,
        brands_stocked,
      } = formData;

      if (!name || !business_type || !province || !city) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Convert arrays to PostgreSQL format
      const servicesArray = services
        ? `{${services.map((s: string) => `"${s.replace(/"/g, '\\"')}""`).join(",")}}`
        : null;
      const brandsArray = brands_stocked
        ? `{${brands_stocked.map((b: string) => `"${b.replace(/"/g, '\\"')}""`).join(",")}}`
        : null;

      const result = await db.execute(
        sql.raw(`
          INSERT INTO businesses (
            name, slug, business_type, province, city, address, phone,
            description, services, brands_stocked, owner_id, is_premium
          ) VALUES (
            '${name.replace(/'/g, "''")}',
            '${slug}',
            '${business_type}',
            '${province}',
            '${city}',
            '${(address || "").replace(/'/g, "''")}',
            '${(phone || "").replace(/'/g, "''")}',
            '${(description || "").replace(/'/g, "''")}',
            ${servicesArray ? `'${servicesArray}'::text[]` : "NULL"},
            ${brandsArray ? `'${brandsArray}'::text[]` : "NULL"},
            '${session.user.id}',
            false
          )
          RETURNING id, slug
        `)
      );

      return NextResponse.json({
        success: true,
        message: "Business listing created successfully",
        data: {
          id: (result.rows[0] as any).id,
          slug: (result.rows[0] as any).slug,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid mode. Use 'self' or 'concierge'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Directory register API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create business listing" },
      { status: 500 }
    );
  }
}
