"use client";

import { useGroupDetail, useLeaveGroup } from "@/hooks/useGroups";
import { GroupInviteCard } from "@/components/group/GroupInviteCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { UsersIcon, MailIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GroupDetailClientProps {
  groupId: string;
}

export function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const { data, isLoading } = useGroupDetail(groupId);
  const leaveGroup = useLeaveGroup();
  const [showInvite, setShowInvite] = useState(false);

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    leaveGroup.mutate(groupId, {
      onSuccess: () => {
        toast.success("Left group");
        window.location.href = "/dashboard/groups";
      },
      onError: () => toast.error("Failed to leave group")
    });
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />)}</div>;
  }

  const group = data?.group;
  const members = data?.members || [];

  if (!group) {
    return <div className="text-center py-12">Group not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/groups" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">← Back to Groups</Link>
          <h1 className="font-serif text-3xl font-bold">{group.name}</h1>
          {group.description && <p className="text-muted-foreground mt-1">{group.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowInvite(true)}>
            <MailIcon className="w-4 h-4 mr-2" />
            Invite
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={leaveGroup.isPending}>
            <UsersIcon className="w-4 h-4 mr-2" />
            Leave Group
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <UsersIcon className="w-4 h-4 mr-2" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invite">
            <MailIcon className="w-4 h-4 mr-2" />
            Invite
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-3">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-card border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-primary">
                    {member.displayName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{member.displayName || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="invite" className="space-y-4">
          {showInvite && (
            <GroupInviteCard
              inviteCode={group.inviteCode}
              inviteUrl={`${window.location.origin}/join/${group.inviteCode}`}
            />
          )}
          {!showInvite && (
            <Button onClick={() => setShowInvite(true)} className="w-full">
              Show Invite Code
            </Button>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-xl border">
            <h3 className="font-semibold mb-4">Group Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invite Code</p>
                  <p className="text-sm text-muted-foreground">{group.inviteCode}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-secondary rounded font-mono">{group.inviteCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-sm text-muted-foreground">{members.length}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}