import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/auth";

const ConciergeSchema = z.object({
  mode: z.literal("concierge"),
  name: z.string().min(1, "Business name is required"),
  website_url: z.string().url("Valid website URL required"),
  contact_email: z.string().email("Valid email required"),
});

const SelfServeSchema = z.object({
  mode: z.literal("self"),
  name: z.string().min(1, "Business name is required"),
  business_type: z.string().min(1, "Business type is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  description: z.string().optional().default(""),
  services: z.array(z.string()).optional().default([]),
  brands_stocked: z.array(z.string()).optional().default([]),
  website_url: z.string().optional(),
  contact_email: z.string().optional(),
});

const DirectoryRegisterSchema = z.union([ConciergeSchema, SelfServeSchema]);

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
    const validation = DirectoryRegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    const { mode, name, website_url, contact_email } = validatedData;

    if (mode === "concierge") {
      // Concierge mode: simple 3-field form

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const result = await db.execute(
        sql`
          INSERT INTO businesses (name, slug, website, email, owner_id, is_premium)
          VALUES (
            ${name},
            ${slug},
            ${website_url},
            ${contact_email},
            ${session.user.id},
            false
          )
          RETURNING id, slug
        `
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
      } = validatedData;

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const result = await db.execute(
        sql`
          INSERT INTO businesses (
            name, slug, business_type, province, city, address, phone,
            description, services, brands_stocked, owner_id, is_premium
          ) VALUES (
            ${name},
            ${slug},
            ${business_type},
            ${province},
            ${city},
            ${address || ""},
            ${phone || ""},
            ${description || ""},
            ${services && services.length > 0 ? sql`ARRAY[${sql.join(services.map((s: string) => sql`${s}`), sql`, `)}]::text[]` : sql`NULL`},
            ${brands_stocked && brands_stocked.length > 0 ? sql`ARRAY[${sql.join(brands_stocked.map((b: string) => sql`${b}`), sql`, `)}]::text[]` : sql`NULL`},
            ${session.user.id},
            false
          )
          RETURNING id, slug
        `
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
