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

describe("shuffleTeams", () => {
  /*
    The 6v4 the group actually hit: twelve signed up, two of Oscuras dropped out and nobody came.
    Sumar jugador asks for people who are not there and dragging is off while the draw is a claim,
    so before this there was no move left at all.
  */
  it("evens out a 6v4 left by two drop-outs", () => {
    usePlayersStore.getState().startMatch(roster(...TEN, "Max", "Willy"), []);

    for (const name of ["Marcos", "Joel"]) usePlayersStore.getState().removePlayer(byName(name).id);

    expect([teams().playingA, teams().playingB]).toEqual([6, 4]);

    usePlayersStore.getState().shuffleTeams();

    expect([teams().playingA, teams().playingB]).toEqual([5, 5]);
  });

  it("deals everyone who is playing and loses nobody", () => {
    const before = usePlayersStore.getState().players.map((p) => p.id).sort();

    usePlayersStore.getState().shuffleTeams();

    const { teamA, teamB } = teams();

    expect([...teamA, ...teamB].map((p) => p.id).sort()).toEqual(before);
  });

  /*
    The button says the teams were mixed. Writing only `.team` onto the signup order made a deal
    that kept most people on their side look identical, and a fluke that handed the same partition
    back looked like a no-op while the history still recorded it. Both of those have to be gone.
  */
  it("changes who is on which side", () => {
    const before = `${teams().namesA.slice().sort()}|${teams().namesB.slice().sort()}`;

    usePlayersStore.getState().shuffleTeams();

    expect(`${teams().namesA.slice().sort()}|${teams().namesB.slice().sort()}`).not.toBe(before);
  });

  it("reorders the list so the panels do not keep the signup order", () => {
    const before = usePlayersStore.getState().players.map((p) => p.id).join(",");

    usePlayersStore.getState().shuffleTeams();

    expect(usePlayersStore.getState().players.map((p) => p.id).join(",")).not.toBe(before);
  });

  /*
    A dropped row keeps its side, so Sumar jugador still offers the person back on the side the
    group last saw them on — and a deal that moved them would move somebody who is not there.
  */
  it("leaves a dropped row on the side it dropped from", () => {
    usePlayersStore.getState().removePlayer(byName("Maci").id);

    const side = usePlayersStore.getState().players.find((p) => p.name === "Maci")!.team;

    usePlayersStore.getState().shuffleTeams();

    expect(usePlayersStore.getState().players.find((p) => p.name === "Maci")!.team).toBe(side);
  });

  it("does not touch the bench or the waiting list", () => {
    const [waiting] = roster("Suplente");
    usePlayersStore.getState().setSubstitutes([waiting]);
    usePlayersStore.getState().replacePlayer(byName("Maci").id, "Teto");

    const bench = usePlayersStore.getState().bench.map((p) => p.name);

    usePlayersStore.getState().shuffleTeams();

    expect(usePlayersStore.getState().bench.map((p) => p.name)).toEqual(bench);
    expect(usePlayersStore.getState().substitutes.map((p) => p.name)).toEqual(["Suplente"]);
  });

  // The history is what keeps the draw honest: a couple dropped out, then the sides were dealt again.
  it("writes one nameless event to the history", () => {
    usePlayersStore.getState().shuffleTeams();

    const [event] = usePlayersStore.getState().history.filter((e) => e.type === "shuffle");

    expect(event).toBeDefined();
    expect(event.old_name).toBeUndefined();
    expect(event.new_name).toBeUndefined();
  });

  it("does nothing with nobody left to deal", () => {
    usePlayersStore.getState().startMatch(roster("Solo"), []);
    usePlayersStore.getState().shuffleTeams();

    expect(usePlayersStore.getState().history).toEqual([]);
  });
});
