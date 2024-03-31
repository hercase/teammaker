import { MatchEvent, Player } from "@/types";
import { generateMatchEvent, generatePlayer } from "@/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayersStore {
  players: Player[];
  bench: Player[];
  history: MatchEvent[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setBench: (bench: Player[]) => void;
  renamePlayer: (id: string, player_name: string) => void;
  removePlayer: (id: string) => void;
  replacePlayer: (old_id: string, player_name: string) => void;
  resetMatch: () => void;
  exchangePlayers: (playerId1: string, playerId2: string) => void;
}

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

            const player = state.players.find((p) => p._key === id);

            if (player) {
              state.history.push(generateMatchEvent({ type: "rename", old_player: player, new_player: newPlayer }));
              player.name = newPlayer.name;
              player.details = newPlayer.details;
            }
          })
        ),
      removePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p._key === id);

            if (player) {
              state.history.push(generateMatchEvent({ type: "delete", old_player: player }));
            }
          })
        ),
      replacePlayer: (old_id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p._key === old_id);

            if (player) {
              const newPlayer = generatePlayer(player_name);

              state.bench.push(newPlayer);

              state.history.push(generateMatchEvent({ type: "replace", old_player: player, new_player: newPlayer }));
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
            const index1 = draft.players.findIndex((p) => p._key === playerId1);
            const index2 = draft.players.findIndex((p) => p._key === playerId2);

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
