import { Metadata } from "next";
import { NewChurchClient } from "./NewChurchClient";

export const metadata: Metadata = {
  title: "Add Church — Sanctum"
};

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{ groupId?: string }>;
}

export default async function NewChurchPage({ params, searchParams }: PageProps) {
  const { groupId } = await searchParams;
  return <NewChurchClient groupId={groupId} />;
}