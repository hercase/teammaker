import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersistedStore = {
  random: boolean;
  location: string;
  setRandom: (random: boolean) => void;
  setLocation: (location: string) => void;
};

export const usePersistedStore = create(
  persist<PersistedStore>(
    (set) => ({
      random: true,
      location: "",
      setRandom: (random) => set({ random: random }),
      setLocation: (location) => set({ location: location }),
    }),
    { name: "persisted-store" }
  )
);
