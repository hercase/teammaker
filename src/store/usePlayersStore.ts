import { PlayersStore } from "@/types";
import { generatePlayer } from "@/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  players: [],
  bench: [],
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
      setBench: (bench) => set(() => ({ bench })),
      renamePlayer: (id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const { name, details } = generatePlayer(player_name);

            const player = state.players.find((p) => p.id === id);

            if (player) {
              player.name = name;
              player.details = details;
            }
          })
        ),
      removePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === id);

            if (player) {
              state.bench.push(player);
              state.history.push({ type: "delete", player, date: new Date() });
            }
          })
        ),
      replacePlayer: (old_id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.findIndex((p) => p.id === old_id);

            if (player) {
              const newPlayer = generatePlayer(player_name);

              state.players[player] = newPlayer;

              state.history.push({
                type: "substitute",
                player: state.players[player],
                new_player: newPlayer,
                date: new Date(),
              });
            }
          })
        ),
      resetMatch: () =>
        set(
          produce((state: PlayersStore) => ({
            ...state,
            players: initialState.players,
            bench: initialState.bench,
            history: initialState.history,
          }))
        ),
      exchangePlayers: (playerId1: string, playerId2: string) =>
        set((state) =>
          produce(state, (draft) => {
            const index1 = draft.players.findIndex((p) => p.id === playerId1);
            const index2 = draft.players.findIndex((p) => p.id === playerId2);

            if (index1 !== -1 && index2 !== -1) {
              [draft.players[index1], draft.players[index2]] = [draft.players[index2], draft.players[index1]];
            }
          })
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
