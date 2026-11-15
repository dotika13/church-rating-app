"use client";

import { useGroups } from "@/hooks/useGroups";
import { GroupCard } from "@/components/group/GroupCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data, isLoading } = useGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Choose a group to explore.</p>
        </div>
        <Button asChild>
          <Link href="/groups/new"><PlusIcon className="w-4 h-4 mr-2" /> New Group</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-muted rounded-xl border" />
          ))}
        </div>
      ) : data?.groups?.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-xl text-muted-foreground mb-2">No groups yet</p>
          <p className="text-muted-foreground mb-4">Create a group to start sharing churches with friends</p>
          <Button asChild>
            <Link href="/groups/new">Create Your First Group</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.groups.map((group: any) => (
            <GroupCard key={group.id} group={group} onClick={() => window.location.href = `/groups/${group.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}