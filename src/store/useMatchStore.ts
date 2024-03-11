import { MatchInputs, MatchState } from "@/types";
import { generatePlayer } from "@/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  players: [],
  substitutes: [],
  replacements: [],
  location: "",
  date: new Date(),
  organizer: "",
  random: false,
  colors: { teamA: "#ffffff", teamB: "#151d65" },
};

export const useMatchStore = create(
  persist<MatchState>(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({
          hasHydrated: state,
        });
      },
      setColors: (colors = { teamA: "#ffffff", teamB: "#151d65" }) => {
        set(() => ({
          colors: { teamA: colors?.teamA, teamB: colors?.teamB },
        }));
      },
      setMatch: (match: Omit<MatchInputs, "list">) => {
        set(
          produce((state: MatchState) => ({
            ...state,
            location: match.location,
            date: match.date,
            organizer: match.organizer,
            random: match.random,
          }))
        );
      },
      setPlayers: (players) => set(() => ({ players })),
      setSubstitutes: (substitutes) => set(() => ({ substitutes })),
      replacePlayer: (old_id, new_user) => {
        set(
          produce((state: MatchState) => {
            if (new_user) {
              const { id, name, details } = generatePlayer(new_user);
              state.substitutes.push({ id, name, details });
              state.replacements.push({ old: old_id, new: id });
            } else {
              state.replacements.push({ old: old_id });
            }
          })
        );
      },
      resetMatch: () =>
        set(
          produce((state: MatchState) => ({
            ...state,
            players: initialState.players,
            substitutes: initialState.substitutes,
            replacements: initialState.replacements,
          }))
        ),
    }),
    {
      name: "match-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
