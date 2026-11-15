export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { ratings, churches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ rating: null });

  const [church] = await db.select({ groupId: churches.groupId }).from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.groupId) {
    const { data: membership } = await supabase
      .from("group_members").select("group_id").eq("group_id", church.groupId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [rating] = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.churchId, id), eq(ratings.userId, user.id)))
    .limit(1);

  return NextResponse.json({ rating: rating || null });
}