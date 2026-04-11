import { NextResponse } from 'next/server'
import { db } from '@/db'
import { boostPackages } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const packages = await db
    .select()
    .from(boostPackages)
    .where(eq(boostPackages.isActive, true))
    .orderBy(boostPackages.displayOrder)

  return NextResponse.json(packages)
}
