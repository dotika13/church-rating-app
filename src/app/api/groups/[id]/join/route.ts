import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { groupJoinSchema } from "@/lib/validation/group";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify group exists and get invite code
  const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = groupJoinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (group.inviteCode !== parsed.data.inviteCode) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }

  // Check already member
  const { data: existing } = await supabase
    .from("group_members").select("group_id").eq("group_id", id).eq("user_id", user.id).single();
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 400 });

  await db.insert(groupMembers).values({ groupId: id, userId: user.id });

  return NextResponse.json({ success: true });
}