import { PlayersStore } from "@/types";
import { generateFullName, generatePlayer } from "@/utils";
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
            const newPlayer = generatePlayer(player_name);

            const player = state.players.find((p) => p.id === id);
            const substitute = state.bench.find((p) => p.id === player?.isReplacedBy);

            if (player && !substitute) {
              state.history.push({
                type: "rename",
                old_name: generateFullName(player),
                new_name: generateFullName(newPlayer),
                date: new Date(),
              });

              player.name = newPlayer.name;
              player.details = newPlayer.details;
            }

            if (substitute) {
              state.history.push({
                type: "rename",
                old_name: generateFullName(substitute),
                new_name: generateFullName(newPlayer),
                date: new Date(),
              });

              substitute.name = newPlayer.name;
              substitute.details = newPlayer.details;
            }
          })
        ),
      removePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === id);

            if (player) {
              player.isDeleted = true;

              state.history.push({ type: "delete", old_name: generateFullName(player), date: new Date() });
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
              player.isDeleted = false;

              state.history.push({
                type: "replace",
                old_name: generateFullName(player),
                new_name: generateFullName(newPlayer),
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
