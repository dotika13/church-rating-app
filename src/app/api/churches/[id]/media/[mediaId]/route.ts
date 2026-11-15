export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { media, churches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const { id, mediaId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [mediaRecord] = await db
    .select({
      id: media.id,
      churchId: media.churchId,
      userId: media.userId,
      storagePath: media.storagePath,
      mimeType: media.mimeType,
      caption: media.caption,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt,
      churchGroupId: churches.groupId
    })
    .from(media)
    .leftJoin(churches, eq(churches.id, media.churchId))
    .where(and(eq(media.id, mediaId), eq(media.churchId, id)))
    .limit(1);

  if (!mediaRecord) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (mediaRecord.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete from storage
  await supabase.storage.from("church-media").remove([mediaRecord.storagePath]);
  // Delete record
  await db.delete(media).where(eq(media.id, mediaId));

  return NextResponse.json({ success: true });
}