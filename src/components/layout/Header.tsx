"use client";

import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store/uiStore";

export function Header() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <MenuIcon className="w-6 h-6" />
          </Button>
          <h1 className="font-serif text-lg font-semibold">Sanctum</h1>
        </div>
      </div>
    </header>
  );
}