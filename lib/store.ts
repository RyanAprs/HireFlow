import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Profile } from "./types"

type AuthStore = {
  profile: Profile | null
  setProfile: (profile: Profile | null) => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      isAdmin: () => get().profile?.role === "admin",
    }),
    {
      name: "auth-storage",
    },
  ),
)
