"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useJoinGroup } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const [code, setCode] = useState("");
  const joinGroup = useJoinGroup();
  const supabase = createClient();
  const urlCode = params.code as string;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/join/${urlCode}`);
      }
    };
    checkAuth();
  }, [urlCode, router, supabase]);

  // Pre-fill code from URL if available
  useEffect(() => {
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [urlCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const inviteCode = code.toUpperCase();

    try {
      // Resolve group ID from invite code
      const res = await fetch(`/api/groups/by-invite/${inviteCode}`);
      if (!res.ok) throw new Error("Invalid invite code");
      const { group } = await res.json();

      await joinGroup.mutateAsync({ groupId: group.id, inviteCode });
      toast.success("Joined group!");
      router.push(`/groups/${group.id}`);
    } catch {
      toast.error("Invalid or expired invite code");
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Join Group</CardTitle>
          <p className="text-muted-foreground">Enter an invite code to join a group</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={code}
                onChange={handleCodeChange}
                placeholder="ABC123XY"
                className="font-mono text-lg tracking-wider text-center"
                maxLength={8}
                required
                disabled={joinGroup.isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={joinGroup.isPending || !code}>
              {joinGroup.isPending ? "Joining..." : "Join Group"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a href="/login" className="text-primary underline">Sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}