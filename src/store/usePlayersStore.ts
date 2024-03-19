import { PlayersStore } from "@/types";
import { generatePlayer } from "@/utils";
import { produce, current } from "immer";
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
            const substitute = state.bench.find((p) => p.id === player?.isReplacedBy);

            if (player && !substitute) {
              player.name = name;
              player.details = details;
            }

            if (substitute) {
              substitute.name = name;
              substitute.details = details;
            }
          })
        ),
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

              state.bench.push(newPlayer);
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
            bench: initialState.bench,
            history: initialState.history,
          }))
        ),
      exchangePlayers: (playerId1: string, playerId2: string) =>
        set((state) =>
          produce(state, (draft) => {
            console.log("draft", current(draft));
            console.log("playerId1", playerId1);
            console.log("playerId2", playerId2);
            const index1 = draft.players.findIndex((p) => p.id === playerId1 || p.isReplacedBy === playerId2);
            const index2 = draft.players.findIndex((p) => p.id === playerId2 || p.isReplacedBy === playerId1);

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
