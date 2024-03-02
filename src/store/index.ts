import { create } from "zustand";
import { Players } from "@/types";
import { persist } from "zustand/middleware";

interface MatchState {
  input: string | null;
  setInput: (input: string) => void;
  players: string[];
  setPlayers: (players: Players) => void;
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
}

export const matchStore = create(
  persist<MatchState>(
    (set) => ({
      input: null,
      setInput: (input: string) => set(() => ({ input })),
      players: [],
      setPlayers: (players: Players) => set(() => ({ players })),
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
    }),
    {
      name: "match-store",
    }
  )
);
