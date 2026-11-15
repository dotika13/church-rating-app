import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GroupDetailClient } from "./GroupDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: "Group Details — Sanctum" };
}

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check membership
  const { data: membership } = await supabase
    .from("group_members").select("group_id").eq("group_id", id).eq("user_id", user.id).single();

  if (!membership) redirect("/dashboard/groups");

  return <GroupDetailClient groupId={id} />;
}