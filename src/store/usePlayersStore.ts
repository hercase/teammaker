import { PlayersStore } from "@/types";
import { generatePlayer } from "@/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  players: [],
  substitutes: [],
  history: [],
};

export const usePlayersStore = create(
  persist<PlayersStore>(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
      setPlayers: (players) => set(() => ({ players })),
      setSubstitutes: (substitutes) => set(() => ({ substitutes })),
      removePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === id);

            if (player) {
              player.isDeleted = true;
              state.history.push({ type: "delete", player_id: id, date: new Date() });
            }
          })
        ),
      replacePlayer: (old_id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === old_id);

            if (player) {
              const newPlayer = generatePlayer(player_name);

              state.substitutes.push(newPlayer);
              player.isReplacedBy = newPlayer.id;
              state.history.push({ type: "substitute", player_id: old_id, date: new Date() });
            }
          })
        ),
      resetMatch: () =>
        set(
          produce((state: PlayersStore) => ({
            ...state,
            players: initialState.players,
            substitutes: initialState.substitutes,
            history: initialState.history,
          }))
        ),
    }),
    {
      name: "players-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
