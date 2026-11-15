import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: membership } = await supabase
    .from("group_members").select("group_id").eq("group_id", id).eq("user_id", user.id).single();
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join/${group.inviteCode}`;

  return NextResponse.json({ inviteCode: group.inviteCode, inviteUrl });
}