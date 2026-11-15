"use client";

import { useGroups, useCreateGroup } from "@/hooks/useGroups";
import { GroupCard } from "@/components/group/GroupCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GroupsPage() {
  const { data, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate({ name, description }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setName("");
        setDescription("");
        toast.success("Group created");
      },
      onError: () => toast.error("Failed to create group")
    });
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">My Groups</h1>
          <p className="text-muted-foreground">Create and manage your church groups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Budapest Churches" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="A group for exploring churches in Budapest..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createGroup.isPending}>{createGroup.isPending ? "Creating..." : "Create Group"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data?.groups?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No groups yet. Create your first group to start collaborating!</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.groups.map((group: any) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => window.location.href = `/dashboard/groups/${group.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}