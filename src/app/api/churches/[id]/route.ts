export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { churches, churchAggregates, ratings, media, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { churchUpdateSchema } from "@/lib/validation/church";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch church with aggregates
  const [church] = await db
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
      avgExterior: churchAggregates.avgExterior,
      avgInterior: churchAggregates.avgInterior,
      avgSurroundings: churchAggregates.avgSurroundings,
      avgAcoustics: churchAggregates.avgAcoustics,
      avgOrgan: churchAggregates.avgOrgan,
      avgVibe: churchAggregates.avgVibe,
      overallScore: churchAggregates.overallScore
    })
    .from(churches)
    .leftJoin(churchAggregates, eq(churchAggregates.churchId, churches.id))
    .where(eq(churches.id, id))
    .limit(1);

  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check access: public or member of group
  if (church.groupId) {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", church.groupId)
      .eq("user_id", user.id)
      .single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch ratings with user profiles
  const ratingsData = await db
    .select({
      id: ratings.id,
      churchId: ratings.churchId,
      userId: ratings.userId,
      exterior: ratings.exterior,
      interior: ratings.interior,
      surroundings: ratings.surroundings,
      acoustics: ratings.acoustics,
      hasOrgan: ratings.hasOrgan,
      organRating: ratings.organRating,
      vibe: ratings.vibe,
      visitDate: ratings.visitDate,
      timeSpentMinutes: ratings.timeSpentMinutes,
      companionsReason: ratings.companionsReason,
      createdAt: ratings.createdAt,
      updatedAt: ratings.updatedAt,
      user: { id: profiles.id, displayName: profiles.displayName, avatarUrl: profiles.avatarUrl }
    })
    .from(ratings)
    .leftJoin(profiles, eq(profiles.id, ratings.userId))
    .where(eq(ratings.churchId, id))
    .orderBy(desc(ratings.createdAt));

  // Fetch media
  const mediaData = await db
    .select()
    .from(media)
    .where(eq(media.churchId, id))
    .orderBy(media.sortOrder);

  return NextResponse.json({ church, ratings: ratingsData, media: mediaData });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [church] = await db.select().from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only group members can update (or creator)
  if (church.groupId) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", church.groupId)
      .eq("user_id", user.id)
      .single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (church.createdBy !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = churchUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [updated] = await db
    .update(churches)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(churches.id, id))
    .returning();

  return NextResponse.json({ church: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [church] = await db.select().from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (church.createdBy !== user.id) {
    return NextResponse.json({ error: "Only creator can delete" }, { status: 403 });
  }

  await db.delete(churches).where(eq(churches.id, id));
  return NextResponse.json({ success: true });
}