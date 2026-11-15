"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface GroupInviteCardProps {
  inviteCode: string;
  inviteUrl: string;
}

export function GroupInviteCard({ inviteCode, inviteUrl }: GroupInviteCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-xl border">
      <h4 className="font-semibold">Invite Members</h4>
      <p className="text-sm text-muted-foreground">
        Share this invite code or link with others to join your group.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Invite Code</label>
          <div className="flex gap-2">
            <Input value={inviteCode} readOnly className="font-mono text-lg tracking-wider" />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(inviteCode, "Invite code")}
              disabled={copied}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Invite Link</label>
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly className="flex-1" />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(inviteUrl, "Invite link")}
              disabled={copied}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}