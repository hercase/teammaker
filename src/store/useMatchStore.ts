import { MatchInputs, MatchStore } from "@/types";
import { DEFAULT_KIT, migrateColorsToKit, parseKit } from "@/utils/kit";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  location: "",
  date: null,
  organizer: "",
  random: false,
  kit: DEFAULT_KIT,
};

export const useMatchStore = create(
  persist<MatchStore>(
    (set) => ({
      ...initialState,
      // Sticky fields, saved as they are typed rather than waiting for a match to be created.
      remember: ({ organizer, location }: { organizer: string; location: string }) => {
        set(() => ({ organizer, location }));
      },
      setMatch: (match: Omit<MatchInputs, "list">) => {
        set(
          produce((state: MatchStore) => ({
            ...state,
            location: match.location,
            date: match.date,
            organizer: match.organizer,
            random: match.random,
            kit: parseKit(match.kit),
          }))
        );
      },
    }),
    {
      name: "match-store",
      version: 1,
      /*
        Version 0 stored `colors: { teamA: hex, teamB: hex }` from the old colour picker. Those
        matches are still in people's browsers, so each hex maps to its closest preset rather than
        being thrown away. Anything that does not parse falls back to the default kit.
      */
      migrate: (persisted, version) => {
        const state = persisted as Partial<MatchStore> & { colors?: unknown };

        return {
          ...state,
          kit: version === 0 ? migrateColorsToKit(state.colors) : parseKit(state.kit),
        } as MatchStore;
      },
    }
  )
);
