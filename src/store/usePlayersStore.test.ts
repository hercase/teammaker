import { beforeEach, describe, expect, it } from "vitest";
import { usePlayersStore } from "@/store/usePlayersStore";
import { countPlaying, generatePlayers, splitTeams } from "@/utils";
import { Player } from "@/types";

/*
  The store, not the split function, is where the teams actually got mangled: a 5v5 plus one
  player for Oscuras came out 6v4 with somebody teleported across the gap. These drive the real
  actions in the order the organiser taps them, because that order is the bug.
*/

const roster = (...names: string[]) => generatePlayers(names.map((name, i) => `${i + 1}. ${name}`).join("\n"));

const TEN = ["Tetas", "Nata", "Mati", "Inti", "Joaco", "Keis", "Marcos", "Joel", "Maci", "Igna"];

const teams = () => {
  const { teamA, teamB } = splitTeams(usePlayersStore.getState().players);

  return {
    teamA,
    teamB,
    playingA: countPlaying(teamA),
    playingB: countPlaying(teamB),
    namesA: teamA.map((player) => player.name),
    namesB: teamB.map((player) => player.name),
  };
};

const byName = (name: string): Player => usePlayersStore.getState().players.find((p) => p.name === name)!;

beforeEach(() => usePlayersStore.getState().startMatch(roster(...TEN), []));

describe("startMatch", () => {
  it("draws the first half into team A and the rest into team B", () => {
    expect(teams().namesA).toEqual(["Tetas", "Nata", "Mati", "Inti", "Joaco"]);
    expect(teams().namesB).toEqual(["Keis", "Marcos", "Joel", "Maci", "Igna"]);
  });

  it("gives the odd player to team A", () => {
    usePlayersStore.getState().startMatch(roster(...TEN, "Teto"), []);

    expect(teams().playingA).toBe(6);
    expect(teams().playingB).toBe(5);
  });
});

describe("addPlayer", () => {
  it("adds to the side that was asked for and moves nobody else", () => {
    usePlayersStore.getState().addPlayer("Teto", "B");

    expect(teams().namesA).toEqual(["Tetas", "Nata", "Mati", "Inti", "Joaco"]);
    expect(teams().namesB).toEqual(["Keis", "Marcos", "Joel", "Maci", "Igna", "Teto"]);
  });

  it("lets team B end up bigger than team A", () => {
    usePlayersStore.getState().addPlayer("Teto", "B");

    expect(teams().playingA).toBe(5);
    expect(teams().playingB).toBe(6);
  });

  it("adds to team A without pushing its last player across", () => {
    usePlayersStore.getState().startMatch(roster(...TEN, "Teto"), []);
    usePlayersStore.getState().addPlayer("Nuevo", "A");

    expect(teams().namesA).toEqual(["Tetas", "Nata", "Mati", "Inti", "Joaco", "Keis", "Nuevo"]);
    expect(teams().namesB).toEqual(["Marcos", "Joel", "Maci", "Igna", "Teto"]);
  });

  /*
    The one that was reported: a drop-out in Oscuras and then someone to cover it. The dropped row
    stays in the list, so the list grew while the number of people on the pitch did not — which is
    exactly what the old halfway rule counted, and Keis went to Claras for a 6v4.
  */
  it("covers a drop-out on the same side it happened", () => {
    usePlayersStore.getState().removePlayer(byName("Maci").id);
    usePlayersStore.getState().addPlayer("Teto", "B");

    expect(teams().playingA).toBe(5);
    expect(teams().playingB).toBe(5);
    expect(teams().namesA).not.toContain("Keis");
  });

  // "Falta uno en Claras" and a Sumar jugador that left Claras just as short.
  it("actually fills the side that is short", () => {
    usePlayersStore.getState().startMatch(roster(...TEN, "Teto"), []);
    usePlayersStore.getState().removePlayer(byName("Mati").id);
    usePlayersStore.getState().addPlayer("Nuevo", "A");

    expect(teams().playingA).toBe(6);
    expect(teams().playingB).toBe(5);
  });
});

describe("addSubstitute", () => {
  it("puts the substitute on the side that asked for them", () => {
    const [waiting] = roster("Suplente");
    usePlayersStore.getState().setSubstitutes([waiting]);
    usePlayersStore.getState().addSubstitute(waiting.id, "B");

    expect(teams().namesB).toContain("Suplente");
    expect(teams().playingA).toBe(5);
    expect(usePlayersStore.getState().substitutes).toEqual([]);
  });
});

describe("removePlayer", () => {
  it("leaves everyone else where they were", () => {
    usePlayersStore.getState().removePlayer(byName("Keis").id);

    expect(teams().namesA).toEqual(["Tetas", "Nata", "Mati", "Inti", "Joaco"]);
    expect(teams().playingB).toBe(4);
  });
});

describe("replacePlayer", () => {
  it("keeps the row, and its side, when someone comes in", () => {
    usePlayersStore.getState().replacePlayer(byName("Maci").id, "Teto");

    expect(teams().playingA).toBe(5);
    expect(teams().playingB).toBe(5);
    expect(teams().teamB.map((p) => p.id)).toContain(byName("Maci").id);
  });
});

describe("exchangePlayers", () => {
  it("swaps two players across the gap, teams included", () => {
    usePlayersStore.getState().exchangePlayers(byName("Nata").id, byName("Marcos").id);

    expect(teams().namesA).toEqual(["Tetas", "Marcos", "Mati", "Inti", "Joaco"]);
    expect(teams().namesB).toEqual(["Keis", "Nata", "Joel", "Maci", "Igna"]);
  });

  it("reorders two players on the same side without moving either of them off it", () => {
    usePlayersStore.getState().exchangePlayers(byName("Tetas").id, byName("Joaco").id);

    expect(teams().namesA).toEqual(["Joaco", "Nata", "Mati", "Inti", "Tetas"]);
    expect(teams().playingB).toBe(5);
  });
});
