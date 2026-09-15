import {
  assignTeams,
  uid,
  firstSurname,
  generateMatchEvent,
  generatePlayer,
  MAX_DETAILS_CHARS,
  clampName,
  shortenFullName,
} from "@/utils";
import { MatchEvent, Player, PlayersStore, TeamSide } from "@/types";
import { shuffle } from "lodash";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
  A new row goes at the end carrying its side, which is the whole of it now that the side is on
  the row. It used to be spliced at a computed index so that splitTeams' halfway point would land
  on the right side of it, and that arithmetic could not win: the point moves when the list grows,
  so half the adds handed the newcomer to the side that asked for them and a bystander to the
  other. Team order is list order, so the last one to sign up shows last on their panel.
*/
const join = (state: PlayersStore, player: Player, side: TeamSide) => {
  state.players.push({ ...player, team: side });
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
      // Both doors a whole list comes through draw the sides, so no row in players is ever sideless.
      setPlayers: (players) => set(() => ({ players: assignTeams(players) })),
      /*
        One action, so a new list can never inherit the last match's bench or history. The home
        page only shows the form once a match has been reset, so in the app this was theoretical;
        the dev bar, which loads fixtures over a match in progress, showed the old events under
        the new teams — and the same door is open to any future caller.
      */
      startMatch: (players, substitutes) => set(() => ({ ...initialState, players: assignTeams(players), substitutes })),
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
      /*
        The way out of a 6v4. Two drop-outs on one side and nobody coming leaves a match that
        cannot be evened: Sumar jugador needs people who are not there, and dragging is off while
        the draw is a claim. Re-drawing is the one move that fixes the sides without breaking that
        claim — nobody picked the teams before and nobody picks them now.

        Only whoever is playing is dealt again. A row that dropped out keeps its side, so Volver a
        sumar still puts the person back where the group last saw them, and the bench and the
        waiting list are not part of a draw at all.
      */
      shuffleTeams: () =>
        set(
          produce((state: PlayersStore) => {
            const playing = state.players.filter((player) => !player.isDeleted);

            if (playing.length < 2) return;

            const sides = new Map(assignTeams(shuffle(playing)).map((player) => [player.id, player.team]));

            state.players.forEach((player) => {
              const side = sides.get(player.id);

              if (side) player.team = side;
            });

            // No name on it: this happened to the match, not to anybody in particular.
            state.history.push({ id: uid(), type: "shuffle", date: new Date() });
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

            if (index1 === -1 || index2 === -1) return;

            const first = draft.players[index1];
            const second = draft.players[index2];

            /*
              The side belongs to the row, not to the player, so a drag across the gap has to hand
              it over: each one lands in the other's place, on the other's team. Swapping only the
              positions left both of them where they were once the side stopped being derived from
              the index.
            */
            [first.team, second.team] = [second.team, first.team];
            [draft.players[index1], draft.players[index2]] = [second, first];
          })
        ),
    }),
    {
      name: "players-store",
      /*
        Version 1 keeps only the first surname. Everything saved before it kept whatever the group
        chat had written, so a match already on someone's phone still read "Ezequiel (Hernandez
        Palomero De La Mancha)" in the list and in every event that mentions him.

        Version 2 writes the side onto the row. Applying the old halfway rule once, here, is what
        keeps a match already on someone's phone on the same two teams it was showing.

        Each step is its own `if` rather than an early return: a phone that skipped a release
        arrives at version 0 and has to walk through both.
      */
      version: 2,
      migrate: (persisted, version) => {
        let state = persisted as PlayersStore;

        if (!state) return state;

        if (version < 1) {
          const shorten = (player: Player): Player => ({
            ...player,
            details: clampName(firstSurname((player.details ?? "").split(/\s+/).filter(Boolean)), MAX_DETAILS_CHARS),
          });

          state = {
            ...state,
            players: (state.players ?? []).map(shorten),
            bench: (state.bench ?? []).map(shorten),
            history: (state.history ?? []).map((event: MatchEvent) => ({
              ...event,
              ...(event.old_name && { old_name: shortenFullName(event.old_name) }),
              ...(event.new_name && { new_name: shortenFullName(event.new_name) }),
            })),
          };
        }

        if (version < 2) state = { ...state, players: assignTeams(state.players ?? []) };

        return state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
