import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const storagePath = path.join("/");

  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse path: churches/{churchId}/{filename}
  const pathParts = storagePath.split("/");
  if (pathParts.length < 2 || pathParts[0] !== "churches") {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const churchId = pathParts[1];

  // Check if church exists and is accessible
  const { data: church, error: churchError } = await supabase
    .from("churches")
    .select("id, group_id")
    .eq("id", churchId)
    .single();

  if (churchError || !church) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If church has a group, verify user is a member
  if (church.group_id) {
    const { data: membership, error: memberError } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", church.group_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  // Public churches (no group_id) are accessible to all authenticated users

  // Get file from Supabase Storage
  const { data, error } = await supabase.storage.from("church-media").download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Determine content type from file extension
  const extension = storagePath.split(".").pop()?.toLowerCase();
  const contentTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime"
  };
  const contentType = contentTypeMap[extension || ""] || "application/octet-stream";

  const arrayBuffer = await data.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}