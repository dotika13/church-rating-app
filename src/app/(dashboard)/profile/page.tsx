"use client";

import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    const updates: { display_name?: string; avatar_url?: string } = {};
    if (displayName.trim()) updates.display_name = displayName.trim();
    if (avatarUrl.trim()) updates.avatar_url = avatarUrl.trim();

    await updateProfile.mutateAsync(updates);
    toast.success("Profile updated");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name || "");
    setAvatarUrl(profile?.avatar_url || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6 bg-card border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="text-2xl">
              {profile?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-serif text-xl font-semibold">{profile?.display_name || "Unnamed"}</h2>
            <p className="text-muted-foreground text-sm">{profile?.id?.slice(0, 12)}...</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName || profile?.display_name || ""}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <div className="flex gap-2">
                <Input
                  id="avatar-url"
                  value={avatarUrl || profile?.avatar_url || ""}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.png"
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + (profile?.id || "user"))}
                  >
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Random
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border rounded-xl p-6">
        <h3 className="font-serif text-lg font-semibold mb-2">Account Info</h3>
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="font-mono break-all">{profile?.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member Since</dt>
            <dd>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}