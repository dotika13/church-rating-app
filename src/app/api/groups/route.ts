import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { groups, groupMembers } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { groupCreateSchema } from "@/lib/validation/group";
import { randomBytes } from "crypto";

function generateInviteCode(): string {
  return randomBytes(4).toString("base64url").toUpperCase(); // 8 chars
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ groups: [] });

  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      inviteCode: groups.inviteCode,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      memberCount: sql<number>`COUNT(${groupMembers.userId})`.as("member_count")
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
    .where(eq(groups.createdBy, user.id))
    .groupBy(groups.id)
    .orderBy(groups.createdAt);

  return NextResponse.json({ groups: userGroups });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = groupCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const [existing] = await db.select().from(groups).where(eq(groups.inviteCode, inviteCode)).limit(1);
    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  const [group] = await db
    .insert(groups)
    .values({
      ...parsed.data,
      inviteCode,
      createdBy: user.id
    })
    .returning();

  // Add creator as member
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id });

  return NextResponse.json({ group }, { status: 201 });
}