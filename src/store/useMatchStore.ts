import { MatchInputs, MatchState } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMatchStore = create(
  persist<MatchState>(
    (set) => ({
      players: [],
      substitutes: [],
      replacements: [],
      location: "",
      date: new Date(),
      organizer: "",
      random: false,
      colors: { teamA: "#ffffff", teamB: "#151d65" },
      setColors: (colors = { teamA: "#ffffff", teamB: "#151d65" }) => {
        set(() => ({
          colors: { teamA: colors?.teamA, teamB: colors?.teamB },
        }));
      },
      setMatch: (match: Omit<MatchInputs, "list">) => {
        set(() => ({
          location: match.location,
          date: match.date,
          organizer: match.organizer,
          random: match.random,
        }));
      },
      setPlayers: (players) => set(() => ({ players })),
      setSubstitutes: (substitutes) => set(() => ({ substitutes })),
      resetMatch: () =>
        set(() => ({
          players: [],
          substitutes: [],
          date: new Date(),
        })),
    }),
    {
      name: "match-store",
    }
  )
);
