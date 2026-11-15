export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { media, churches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

const mediaUploadSchema = z.object({
  mimeType: z.string().regex(/^(image|video)\//),
  caption: z.string().optional()
});

const mediaRecordSchema = z.object({
  storagePath: z.string(),
  mimeType: z.string(),
  caption: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [church] = await db.select({ groupId: churches.groupId }).from(churches).where(eq(churches.id, id)).limit(1);
  if (!church) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (church.groupId) {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: membership } = await supabase
      .from("group_members").select("group_id").eq("group_id", church.groupId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mediaData = await db.select().from(media).where(eq(media.churchId, id)).orderBy(media.sortOrder);
  return NextResponse.json({ media: mediaData });
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
  if (church.groupId) {
    const { data: membership } = await supabase
      .from("group_members").select("group_id").eq("group_id", church.groupId).eq("user_id", user.id).single();
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // If body has storagePath, create record
  if (body.storagePath) {
    const parsed = mediaRecordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [record] = await db
      .insert(media)
      .values({
        churchId: id,
        userId: user.id,
        ...parsed.data,
        sortOrder: (await db.select({ count: sql<number>`COUNT(*)` }).from(media).where(eq(media.churchId, id)))[0].count
      })
      .returning();

    return NextResponse.json({ media: record });
  }

  // Otherwise, return signed upload URL
  const parsed = mediaUploadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { mimeType } = parsed.data;
  const ext = mimeType.split("/")[1];
  const storagePath = `${id}/${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("church-media")
    .createSignedUploadUrl(storagePath, { upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, storagePath, mediaId: crypto.randomUUID() });
}