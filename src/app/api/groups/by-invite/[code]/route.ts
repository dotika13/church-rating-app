import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const upperCode = code.toUpperCase();

  const [group] = await db.select().from(groups).where(eq(groups.inviteCode, upperCode)).limit(1);
  if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  return NextResponse.json({ group: { id: group.id, name: group.name, inviteCode: group.inviteCode } });
}