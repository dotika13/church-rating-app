export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { churches, churchAggregates } from "@/db/schema";
import { eq, and, or, ilike, sql, inArray, isNull } from "drizzle-orm";
import { churchListQuerySchema, churchCreateSchema } from "@/lib/validation/church";
import { geocodeAddress } from "@/lib/geocoding";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = churchListQuerySchema.safeParse(searchParams);
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const { groupId, denomination, minRating, hasOrgan, search, limit, offset, north, south, east, west } = parsed.data;

  // Build where conditions
  const conditions = [];

  // Group filter: public (null) OR user's groups
  if (user) {
    if (groupId) {
      conditions.push(eq(churches.groupId, groupId));
    } else {
      // Get user's group IDs
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      const groupIds = memberships?.map((m) => m.group_id) || [];
      conditions.push(or(isNull(churches.groupId), inArray(churches.groupId, groupIds)));
    }
  } else {
    conditions.push(isNull(churches.groupId)); // Public only
  }

  if (denomination) conditions.push(eq(churches.denomination, denomination as "catholic" | "protestant" | "orthodox" | "other" | "ecumenical"));
  if (search) conditions.push(ilike(churches.name, `%${search}%`));
  if (north && south && east && west) {
    conditions.push(sql`${churches.lat} BETWEEN ${south} AND ${north}`);
    conditions.push(sql`${churches.lng} BETWEEN ${west} AND ${east}`);
  }

  // Add aggregate conditions to the where clause (since we're joining churchAggregates)
  if (minRating) conditions.push(sql`${churchAggregates.overallScore} >= ${minRating}`);
  if (hasOrgan) conditions.push(sql`${churchAggregates.avgOrgan} IS NOT NULL`);

  // Join aggregates for rating filters
  let query = db
    .select({
      id: churches.id,
      name: churches.name,
      denomination: churches.denomination,
      address: churches.address,
      lat: churches.lat,
      lng: churches.lng,
      yearBuilt: churches.yearBuilt,
      architecturalStyle: churches.architecturalStyle,
      website: churches.website,
      serviceTimes: churches.serviceTimes,
      description: churches.description,
      patronSaint: churches.patronSaint,
      heritageStatus: churches.heritageStatus,
      organBuilder: churches.organBuilder,
      organSpecs: churches.organSpecs,
      capacity: churches.capacity,
      wheelchairAccessible: churches.wheelchairAccessible,
      parkingInfo: churches.parkingInfo,
      virtualTourUrl: churches.virtualTourUrl,
      createdBy: churches.createdBy,
      groupId: churches.groupId,
      createdAt: churches.createdAt,
      updatedAt: churches.updatedAt,
      ratingCount: churchAggregates.ratingCount,
      overallScore: churchAggregates.overallScore,
      avgOrgan: churchAggregates.avgOrgan
    })
    .from(churches)
    .leftJoin(churchAggregates, eq(churchAggregates.churchId, churches.id))
    .where(and(...conditions))
    .orderBy(churches.createdAt)
    .limit(limit)
    .offset(offset);

  const results = await query;

  return NextResponse.json({ churches: results });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = churchCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { lat, lng, groupId, ...rest } = parsed.data;

  // Verify group membership if groupId provided
  if (groupId) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();
    if (!membership) return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  // Geocode address if provided but no coords (should not happen with map pin)
  let finalLat = lat, finalLng = lng;
  if (rest.address && (!lat || !lng)) {
    const geocoded = await geocodeAddress(rest.address);
    if (geocoded) { finalLat = geocoded.lat; finalLng = geocoded.lng; }
  }

  const [church] = await db
    .insert(churches)
    .values({
      ...rest,
      lat: finalLat,
      lng: finalLng,
      createdBy: user.id,
      groupId: groupId || null
    })
    .returning();

  return NextResponse.json({ church }, { status: 201 });
}