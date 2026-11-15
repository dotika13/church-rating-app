"use client";

import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldIcon, BellIcon, PaletteIcon, Loader2Icon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(profile?.id || "");
      if (error) throw error;
      toast.success("Account deleted");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
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
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account"><UserIcon className="w-4 h-4 mr-2" /> Account</TabsTrigger>
          <TabsTrigger value="notifications"><BellIcon className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><PaletteIcon className="w-4 h-4 mr-2" /> Appearance</TabsTrigger>
          <TabsTrigger value="danger"><ShieldIcon className="w-4 h-4 mr-2" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your display name and avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm profile={profile} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account identification information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">User ID</dt>
                  <dd className="font-mono break-all">{profile?.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationSetting
                title="Email Notifications"
                description="Receive email updates about group activity"
                defaultChecked={true}
              />
              <NotificationSetting
                title="Push Notifications"
                description="Receive browser push notifications"
                defaultChecked={false}
              />
              <NotificationSetting
                title="Weekly Digest"
                description="Weekly summary of new churches and ratings"
                defaultChecked={true}
              />
              <NotificationSetting
                title="Group Invites"
                description="Notify me when invited to a group"
                defaultChecked={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Sanctum looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AppearanceSetting
                title="Theme"
                description="Choose your preferred color scheme"
                options={[
                  { value: "system", label: "System", description: "Follow system preference" },
                  { value: "light", label: "Light", description: "Always use light mode" },
                  { value: "dark", label: "Dark", description: "Always use dark mode" },
                ]}
              />
              <AppearanceSetting
                title="Map Style"
                description="Choose the default map appearance"
                options={[
                  { value: "liberty", label: "Liberty", description: "Clean, minimal style" },
                  { value: "osm-bright", label: "OSM Bright", description: "Classic OpenStreetMap" },
                ]}
              />
              <AppearanceSetting
                title="Density"
                description="Adjust UI spacing"
                options={[
                  { value: "comfortable", label: "Comfortable", description: "Default spacing" },
                  { value: "compact", label: "Compact", description: "Tighter spacing" },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-destructive">Sign Out Everywhere</p>
                  <p className="text-sm text-muted-foreground">Sign out of all devices and sessions</p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out Everywhere
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-48"
                    disabled={isDeleting}
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirm !== "DELETE"}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSettingsForm({ profile }: { profile: any }) {
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  const handleSave = async () => {
    const updates: { display_name?: string; avatar_url?: string } = {};
    if (displayName.trim()) updates.display_name = displayName.trim();
    if (avatarUrl.trim()) updates.avatar_url = avatarUrl.trim();

    await updateProfile.mutateAsync(updates);
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-display-name">Display Name</Label>
          <Input
            id="settings-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-avatar-url">Avatar URL</Label>
          <Input
            id="settings-avatar-url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

function NotificationSetting({ title, description, defaultChecked }: { title: string; description: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

function AppearanceSetting({ title, description, options }: { title: string; description: string; options: { value: string; label: string; description: string }[] }) {
  const [value, setValue] = useState(options[0].value);
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full max-w-xs px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}