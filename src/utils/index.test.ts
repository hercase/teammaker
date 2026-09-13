import { describe, expect, it } from "vitest";
import { generatePlayer, generatePlayers, splitTeams, validateName } from "@/utils";
import { DUPLICATE_NAMES_LIST, expiredDate, nextWednesdayAt, ODD_LIST, USUAL_LIST } from "@/fixtures";

describe("generatePlayer", () => {
  it("uses the first word as the name and the rest as details", () => {
    const player = generatePlayer("Fede Camino");

    expect(player.name).toBe("Fede");
    expect(player.details).toBe("Camino");
  });

  it("leaves details empty for single-word names", () => {
    expect(generatePlayer("Lucho").details).toBe("");
  });

  it("keeps accents and ñ", () => {
    expect(generatePlayer("Martín").name).toBe("Martín");
    expect(generatePlayer("Iñaki").name).toBe("Iñaki");
  });

  it("drops emoji and punctuation that come from the pasted message", () => {
    expect(generatePlayer("⚽ Lucho!").name).toBe("Lucho");
  });
});

describe("generatePlayers", () => {
  it("strips the list numbering that comes from the pasted message", () => {
    const players = generatePlayers("1. Lucho\n2. Mura\n3. Mauro");

    expect(players.map((p) => p.name)).toEqual(["Lucho", "Mura", "Mauro"]);
  });

  it("ignores blank lines", () => {
    expect(generatePlayers("1. Lucho\n\n\n2. Mura")).toHaveLength(2);
  });

  it("keeps both players when two people share the same name", () => {
    const players = generatePlayers("1. Mati\n2. Nacho\n3. Mati");

    expect(players.map((p) => p.name)).toEqual(["Mati", "Nacho", "Mati"]);
  });

  it("keeps the twelve players of the usual list", () => {
    expect(generatePlayers(USUAL_LIST)).toHaveLength(12);
  });

  it("keeps every player of the fixture with repeated names", () => {
    const players = generatePlayers(DUPLICATE_NAMES_LIST);

    expect(players).toHaveLength(12);
    expect(players.filter((p) => p.name === "Mati" && !p.details)).toHaveLength(2);
  });

  it("creates no player for a line that has no letters", () => {
    expect(generatePlayers("1. Lucho\n🏟️\n2. Mura")).toHaveLength(2);
  });

  it("gives every player an id that cannot collide across page loads", () => {
    const [player] = generatePlayers("1. Mati");

    expect(player.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe("splitTeams", () => {
  const playersNamed = (count: number) =>
    generatePlayers(Array.from({ length: count }, (_, i) => `Jugador${i}`).join("\n"));

  it("splits an even list in half", () => {
    const { teamA, teamB } = splitTeams(playersNamed(12));

    expect(teamA).toHaveLength(6);
    expect(teamB).toHaveLength(6);
  });

  it("puts the extra player on team A when the list is odd", () => {
    const { teamA, teamB } = splitTeams(playersNamed(11));

    expect(teamA).toHaveLength(6);
    expect(teamB).toHaveLength(5);
  });

  it("never puts the same player on both teams", () => {
    const { teamA, teamB } = splitTeams(playersNamed(11));
    const shared = teamA.filter((player) => teamB.some((other) => other.id === player.id));

    expect(shared).toEqual([]);
  });

  it("handles an empty list", () => {
    expect(splitTeams([])).toEqual({ teamA: [], teamB: [] });
  });
});

describe("validateName", () => {
  it("accepts accents and ñ", () => {
    expect(validateName("Martín")).toBeUndefined();
    expect(validateName("Iñaki")).toBeUndefined();
  });

  it("rejects an empty name", () => {
    expect(validateName("")).toBe("Debes ingresar un nombre");
  });

  it("rejects digits", () => {
    expect(validateName("Mati 10")).toBe("Nombre inválido (solo letras, paréntesis y espacios)");
  });
});

describe("fixtures", () => {
  it("splits the odd fixture into teams of six and five", () => {
    const { teamA, teamB } = splitTeams(generatePlayers(ODD_LIST));

    expect(teamA).toHaveLength(6);
    expect(teamB).toHaveLength(5);
  });
});

describe("nextWednesdayAt", () => {
  it("aims at the wednesday of the same week when it has not happened yet", () => {
    // Monday, september 14th 2026
    expect(nextWednesdayAt(18, 30, new Date(2026, 8, 14, 10, 0))).toBe("2026-09-16T18:30");
  });

  it("keeps today when the match is still ahead", () => {
    expect(nextWednesdayAt(18, 30, new Date(2026, 8, 16, 10, 0))).toBe("2026-09-16T18:30");
  });

  it("jumps a week when today's match already started", () => {
    expect(nextWednesdayAt(18, 30, new Date(2026, 8, 16, 20, 0))).toBe("2026-09-23T18:30");
  });
});

describe("expiredDate", () => {
  it("lands a week in the past", () => {
    expect(expiredDate(new Date(2026, 8, 16, 18, 30))).toBe("2026-09-09T18:30");
  });
});
