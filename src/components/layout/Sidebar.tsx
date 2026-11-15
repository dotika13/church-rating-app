"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UsersIcon, MapPinIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/groups", label: "My Groups", icon: UsersIcon },
  { href: "/map", label: "Explore Map", icon: MapPinIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, setUser } = useAuthStore();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col hidden lg:flex">
      <div className="p-4 border-b">
        <h1 className="font-serif text-xl font-semibold">Sanctum</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-sm font-medium text-primary">
                {profile?.display_name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.display_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.id?.slice(0, 8)}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-2 justify-start gap-2" onClick={handleSignOut}>
          <LogOutIcon className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}