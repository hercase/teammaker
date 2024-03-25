import { ProfileStore } from "@/types/stores";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  profile: null,
};

export const useMatchStore = create(
  persist<ProfileStore>(
    (set) => ({
      ...initialState,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "profile-store",
    }
  )
);
