import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  profile: { id: string; display_name: string | null; avatar_url: string | null } | null;
  setProfile: (profile: AuthState["profile"]) => void;
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  profile: null,
  setProfile: (profile) => set({ profile }),
  currentGroupId: null,
  setCurrentGroupId: (currentGroupId) => set({ currentGroupId })
}));