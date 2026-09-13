import {
  firstSurname,
  generateMatchEvent,
  generatePlayer,
  MAX_DETAILS_CHARS,
  clampName,
  shortenFullName,
} from "@/utils";
import { MatchEvent, Player, PlayersStore, TeamSide } from "@/types";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
  Where a new row has to go for splitTeams to hand it to the right side: team A is the first
  ceil(n/2) rows, so a player for A goes in at the end of that half and one for B at the end.
*/
const insertionIndex = (count: number, side: TeamSide): number =>
  side === "B" ? count : Math.ceil((count + 1) / 2) - 1;

const join = (state: PlayersStore, player: Player, side: TeamSide) => {
  state.players.splice(insertionIndex(state.players.length, side), 0, player);
  state.history.push(generateMatchEvent({ type: "join", old_player: player }));
};

// Who the row shows: the substitute, if one came in, else the player who signed up.
const drawn = (state: PlayersStore, player: Player): Player =>
  state.bench.find((p) => p.id === player.isReplacedBy) ?? player;

const initialState = {
  players: [],
  bench: [],
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
      /*
        One action, so a new list can never inherit the last match's bench or history. The home
        page only shows the form once a match has been reset, so in the app this was theoretical;
        the dev bar, which loads fixtures over a match in progress, showed the old events under
        the new teams — and the same door is open to any future caller.
      */
      startMatch: (players, substitutes) => set(() => ({ ...initialState, players, substitutes })),
      setBench: (bench) => set(() => ({ bench })),
      setSubstitutes: (substitutes) => set(() => ({ substitutes })),
      promoteSubstitute: (old_id: string, substitute_id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === old_id);
            const index = (state.substitutes ?? []).findIndex((p) => p.id === substitute_id);

            if (!player || index === -1) return;

            const [substitute] = state.substitutes.splice(index, 1);
            const leaving = drawn(state, player);

            state.bench.push(substitute);
            player.isReplacedBy = substitute.id;
            player.isDeleted = false;

            state.history.push(generateMatchEvent({ type: "replace", old_player: leaving, new_player: substitute }));
          })
        ),
      renamePlayer: (id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const newPlayer = generatePlayer(player_name);

            const player = state.players.find((p) => p.id === id);
            const substitute = state.bench.find((p) => p.id === player?.isReplacedBy);

            if (player && !substitute) {
              state.history.push(generateMatchEvent({ type: "rename", old_player: player, new_player: newPlayer }));
              player.name = newPlayer.name;
              player.details = newPlayer.details;
            }

            if (substitute) {
              state.history.push(generateMatchEvent({ type: "rename", old_player: substitute, new_player: newPlayer }));

              substitute.name = newPlayer.name;
              substitute.details = newPlayer.details;
            }
          })
        ),
      removePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === id);

            /*
              isDeleted is about the row, whoever it shows: a substitute who came in and then drops
              out leaves the same hole, and the history names the person who left, not the one
              they had replaced. isReplacedBy is kept, so Volver a sumar brings the right one back.
            */
            if (player && !player.isDeleted) {
              player.isDeleted = true;

              state.history.push(generateMatchEvent({ type: "delete", old_player: drawn(state, player) }));
            }
          })
        ),
      restorePlayer: (id: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === id);

            if (player?.isDeleted) {
              player.isDeleted = false;

              // The drop-out stays in the history: both things happened.
              state.history.push(generateMatchEvent({ type: "restore", old_player: drawn(state, player) }));
            }
          })
        ),
      addPlayer: (player_name: string, side: TeamSide) =>
        set(produce((state: PlayersStore) => join(state, generatePlayer(player_name), side))),
      addSubstitute: (substitute_id: string, side: TeamSide) =>
        set(
          produce((state: PlayersStore) => {
            const index = (state.substitutes ?? []).findIndex((p) => p.id === substitute_id);

            if (index === -1) return;

            const [substitute] = state.substitutes.splice(index, 1);

            join(state, substitute, side);
          })
        ),
      replacePlayer: (old_id: string, player_name: string) =>
        set(
          produce((state: PlayersStore) => {
            const player = state.players.find((p) => p.id === old_id);

            if (player) {
              const newPlayer = generatePlayer(player_name);
              const leaving = drawn(state, player);

              state.bench.push(newPlayer);
              player.isReplacedBy = newPlayer.id;
              player.isDeleted = false;

              state.history.push(generateMatchEvent({ type: "replace", old_player: leaving, new_player: newPlayer }));
            }
          })
        ),
      resetMatch: () =>
        set(
          produce((state: PlayersStore) => ({
            ...state,
            players: initialState.players,
            bench: initialState.bench,
            substitutes: initialState.substitutes,
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
      /*
        Version 1 keeps only the first surname. Everything saved before it kept whatever the group
        chat had written, so a match already on someone's phone still read "Ezequiel (Hernandez
        Palomero De La Mancha)" in the list and in every event that mentions him.
      */
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as PlayersStore;

        if (version >= 1 || !state) return state;

        const shorten = (player: Player): Player => ({
          ...player,
          details: clampName(firstSurname((player.details ?? "").split(/\s+/).filter(Boolean)), MAX_DETAILS_CHARS),
        });

        return {
          ...state,
          players: (state.players ?? []).map(shorten),
          bench: (state.bench ?? []).map(shorten),
          history: (state.history ?? []).map((event: MatchEvent) => ({
            ...event,
            old_name: shortenFullName(event.old_name),
            ...(event.new_name && { new_name: shortenFullName(event.new_name) }),
          })),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
