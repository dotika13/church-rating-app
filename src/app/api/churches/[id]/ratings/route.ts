export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { ratings, profiles, churches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const ratingUpsertSchema = z.object({
  exterior: z.number().int().min(1).max(10),
  interior: z.number().int().min(1).max(10),
  surroundings: z.number().int().min(1).max(10),
  acoustics: z.number().int().min(1).max(10),
  hasOrgan: z.boolean(),
  organRating: z.number().int().min(1).max(10).optional().nullable(),
  vibe: z.number().int().min(1).max(10),
  visitDate: z.string().date().optional().nullable(),
  timeSpentMinutes: z.number().int().min(0).optional().nullable(),
  companionsReason: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check church access
  const [church] = await db.select({ groupId: churches.groupId }).from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.groupId) {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: membership } = await supabase
      .from("group_members").select("group_id").eq("group_id", church.groupId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  return NextResponse.json({ ratings: ratingsData });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [church] = await db.select().from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check access
  if (church.groupId) {
    const { data: membership } = await supabase
      .from("group_members").select("group_id").eq("group_id", church.groupId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = ratingUpsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { organRating, ...rest } = parsed.data;
  const finalOrganRating = rest.hasOrgan ? organRating : null;

  const [upserted] = await db
    .insert(ratings)
    .values({
      churchId: id,
      userId: user.id,
      ...rest,
      organRating: finalOrganRating
    })
    .onConflictDoUpdate({
      target: [ratings.churchId, ratings.userId],
      set: { ...rest, organRating: finalOrganRating, updatedAt: new Date() }
    })
    .returning();

  return NextResponse.json({ rating: upserted });
}