import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MatchState {
  location: string;
  setLocation: (location: string) => void;
  date: string;
  setDate: (date: string) => void;
  creator: string;
  setCreator: (creator: string) => void;
  max_players: number;
  setMaxPlayers: (max_players: number) => void;
  random: boolean;
  setRandom: (random: boolean) => void;
  colorA: string;
  setColorA: (colorA: string) => void;
  colorB: string;
  setColorB: (colorB: string) => void;
}

export const matchStore = create(
  persist<MatchState>(
    (set) => ({
      location: "",
      setLocation: (location: string) => set(() => ({ location })),
      date: new Date().toISOString().split("T")[0],
      setDate: (date: string) => set(() => ({ date })),
      creator: "",
      setCreator: (creator: string) => set(() => ({ creator })),
      max_players: 12,
      setMaxPlayers: (max_players: number) => set(() => ({ max_players })),
      random: false,
      setRandom: (random: boolean) => set(() => ({ random })),
      colorA: "#ffffff",
      setColorA: (colorA: string) => set(() => ({ colorA })),
      colorB: "#151d65",
      setColorB: (colorB: string) => set(() => ({ colorB })),
    }),
    {
      name: "match-store",
    }
  )
);
