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
  price: null,
};

export const useMatchStore = create(
  persist<MatchStore>(
    (set) => ({
      ...initialState,
      /*
        Sticky fields, saved as they are chosen rather than waiting for a match to be created. The
        group plays the same way every week — same pitch, same person organising, same way of
        telling the sides apart — so asking again every Tuesday is asking for nothing.

        Partial, because the form remembers what you typed and the kit remembers what you picked,
        and those happen at different moments.
      */
      remember: (fields) => {
        set((state) => ({
          ...state,
          ...fields,
          ...(fields.kit && { kit: parseKit(fields.kit) }),
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
            kit: parseKit(match.kit),
            price: match.price ?? null,
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
