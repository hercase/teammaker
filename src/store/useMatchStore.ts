import { MatchInputs, MatchStore } from "@/types";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  location: "",
  date: null,
  organizer: "",
  random: false,
  colors: { teamA: "#e3e3e3", teamB: "#151d65" },
};

export const useMatchStore = create(
  persist<MatchStore>(
    (set) => ({
      ...initialState,
      setOrganizer: (organizer: string) => {
        set(() => ({ organizer }));
      },
      setColors: (colors = { teamA: "#e3e3e3", teamB: "#151d65" }) => {
        set(() => ({
          colors: { teamA: colors?.teamA, teamB: colors?.teamB },
        }));
      },

      setMatch: (match: Omit<MatchInputs, "list">) => {
        set(
          produce((state: MatchStore) => ({
            ...state,
            location: match.location,
            date: match.date,
            organizer: match.organizer,
            random: match.random,
          }))
        );
      },
    }),
    {
      name: "match-store",
    }
  )
);
