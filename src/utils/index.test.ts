import { describe, expect, it } from "vitest";
import {
  clampName,
  countPlayers,
  countPlaying,
  duplicateTags,
  firstSurname,
  formatMoney,
  parsePrice,
  generateMatchEvent,
  generatePlayer,
  generatePlayers,
  MAX_DETAILS_CHARS,
  MAX_FULL_NAME_CHARS,
  MAX_NAME_CHARS,
  pricePerPlayer,
  shortenFullName,
  splitRoster,
  splitTeams,
  validateName,
} from "@/utils";
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

  it("keeps a nickname in brackets whole, and apart from the name", () => {
    const player = generatePlayer("Andres(el titan)");

    expect(player.name).toBe("Andres");
    expect(player.details).toBe("el titan");
  });
});

describe("generatePlayers", () => {
  it("leaves the title, the day and the pitch of a real message off the teams", () => {
    const message =
      "Partido de los miercoles\n\n⏳Miércoles 18.30hrs\n🏟️ Cancha: Quintana y Salta\n\n⬇️ Esta semana:\n\n1. Lucho\n2. Mura\n3. Mauro\n4. Lihue";

    expect(generatePlayers(message).map((p) => p.name)).toEqual(["Lucho", "Mura", "Mauro", "Lihue"]);
    expect(countPlayers(message)).toBe(4);
  });

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

describe("duplicateTags", () => {
  const labelled = (...labels: string[]) => labels.map((label, i) => ({ id: `id-${i}`, label }));

  it("numbers players who end up with the exact same name", () => {
    expect(duplicateTags(labelled("Mati", "Nacho", "Mati"))).toEqual({ "id-0": 1, "id-2": 2 });
  });

  it("leaves unique names alone", () => {
    expect(duplicateTags(labelled("Lucho", "Mura", "Mauro"))).toEqual({});
  });

  it("treats a name with details as a different person", () => {
    expect(duplicateTags(labelled("Mati", "Mati R"))).toEqual({});
  });

  it("numbers three of a kind in list order", () => {
    expect(duplicateTags(labelled("Eze", "Eze", "Eze"))).toEqual({ "id-0": 1, "id-1": 2, "id-2": 3 });
  });
});

describe("generateMatchEvent", () => {
  const player = { id: "p1", name: "Mauro", details: "" };

  it("gives every event its own id, even two in the same second", () => {
    const a = generateMatchEvent({ type: "delete", old_player: player });
    const b = generateMatchEvent({ type: "delete", old_player: player });

    expect(a.id).not.toBe(b.id);
  });
});

/*
  A real substitution in the group chat produced "Ezequiel (Hernandez Palomero De La Mancha)",
  which on a phone pushed the row menu off the edge of the card. Names are cut where they are made,
  so the teams, the history and the screenshot never disagree about what someone is called.
*/
describe("clampName", () => {
  it("leaves a name that fits exactly as it is", () => {
    expect(clampName("Hernandez", 18)).toBe("Hernandez");
    expect(clampName("x".repeat(18), 18)).toBe("x".repeat(18));
  });

  it("drops whole words rather than ending mid-syllable", () => {
    expect(clampName("Hernandez Palomero De La Mancha", 18)).toBe("Hernandez…");
  });

  it("cuts a single long word where it lands, having no boundary to fall back on", () => {
    expect(clampName("Bartolomeodelosmilagros", 14)).toBe("Bartolomeodelo…");
  });

  it("leaves no space hanging before the ellipsis", () => {
    expect(clampName("Ana Belen Rodriguez", 10)).toBe("Ana Belen…");
  });

  it("has nothing to do to an empty string", () => {
    expect(clampName("", 14)).toBe("");
  });
});

describe("generatePlayer with very long names", () => {
  it("caps the first name", () => {
    const player = generatePlayer("Maximilianoalejandro");

    expect(player.name).toHaveLength(MAX_NAME_CHARS + 1); // the ellipsis is one character
    expect(player.name.endsWith("…")).toBe(true);
  });

  // The surname rule normally gets there first; the character cap is what catches one absurd word.
  it("caps a single surname that is absurd on its own", () => {
    const player = generatePlayer("Ezequiel Hernandezpalomerodelamancha");

    expect(player.name).toBe("Ezequiel");
    expect(player.details?.endsWith("…")).toBe(true);
    expect(player.details?.length ?? 0).toBeLessThanOrEqual(MAX_DETAILS_CHARS + 1);
  });

  it("leaves an ordinary two-word name untouched", () => {
    const player = generatePlayer("Fede Camino");

    expect(player.name).toBe("Fede");
    expect(player.details).toBe("Camino");
  });

  it("caps a name pasted as a whole paragraph", () => {
    const player = generatePlayer("1. " + "Juan ".repeat(40));

    expect(player.name.length).toBeLessThanOrEqual(MAX_NAME_CHARS + 1);
    expect(player.details?.length ?? 0).toBeLessThanOrEqual(MAX_DETAILS_CHARS + 1);
  });
});

describe("countPlayers", () => {
  it("agrees with generatePlayers on the usual list", () => {
    expect(countPlayers(USUAL_LIST)).toBe(generatePlayers(USUAL_LIST).length);
  });

  it("does not count a line that would produce no player", () => {
    const list = "1. Lucho\n⚽⚽⚽\n18:30\n2. Mura";

    expect(countPlayers(list)).toBe(2);
    expect(countPlayers(list)).toBe(generatePlayers(list).length);
  });

  it("counts nothing in an empty box", () => {
    expect(countPlayers("")).toBe(0);
    expect(countPlayers("\n\n\n")).toBe(0);
  });
});

describe("validateName length", () => {
  it("accepts a name that fits", () => {
    expect(validateName("Ezequiel Hernandez")).toBeUndefined();
  });

  /*
    Typed by hand, rather than pasted, so it is worth saying out loud: silently swallowing two
    thirds of what someone just wrote into a rename box reads as the app losing the keystrokes.
  */
  it("says so rather than silently trimming a name typed into a dialog", () => {
    expect(validateName("Ezequiel Hernandez Palomero De La Mancha")).toMatch(String(MAX_FULL_NAME_CHARS));
  });

  it("accepts exactly the maximum", () => {
    expect(validateName("a".repeat(MAX_FULL_NAME_CHARS))).toBeUndefined();
  });

  it("does not count the spaces someone left around the name", () => {
    expect(validateName(`  ${"a".repeat(MAX_FULL_NAME_CHARS)}  `)).toBeUndefined();
  });
});

/*
  The bracketed half of a name exists to tell two Matis apart, so it is the first surname and
  nothing after it. A surname is not always one word, which is the whole difficulty.
*/
describe("firstSurname", () => {
  it("takes one surname and leaves the rest of the paperwork", () => {
    expect(firstSurname(["Hernandez", "Palomero", "De", "La", "Mancha"])).toBe("Hernandez");
  });

  it("keeps a surname that is spelled in more than one word", () => {
    expect(firstSurname(["Di", "Stefano"])).toBe("Di Stefano");
    expect(firstSurname(["De", "La", "Mancha"])).toBe("De La Mancha");
    expect(firstSurname(["van", "Dijk"])).toBe("van Dijk");
    expect(firstSurname(["Mac", "Allister"])).toBe("Mac Allister");
  });

  it("carries a single surname through untouched", () => {
    expect(firstSurname(["Camino"])).toBe("Camino");
  });

  it("has nothing to take from a one-word name", () => {
    expect(firstSurname([])).toBe("");
  });

  it("does not mistake a particle inside the discarded part for the start of one", () => {
    expect(firstSurname(["Gonzalez", "de", "la", "Vega"])).toBe("Gonzalez");
  });
});

describe("generatePlayer keeps only the first surname", () => {
  it("files the long one under its first surname", () => {
    const player = generatePlayer("Ezequiel Hernandez Palomero de la Mancha");

    expect(player.name).toBe("Ezequiel");
    expect(player.details).toBe("Hernandez");
  });

  it("keeps a compound surname whole", () => {
    expect(generatePlayer("Ezequiel Di Stefano").details).toBe("Di Stefano");
    expect(generatePlayer("Nico de la Mancha").details).toBe("de la Mancha");
  });

  it("leaves the everyday case exactly as it was", () => {
    expect(generatePlayer("Fede Camino").details).toBe("Camino");
    expect(generatePlayer("Lucho").details).toBe("");
  });
});

describe("shortenFullName", () => {
  it("applies the same rule to a name already written out", () => {
    expect(shortenFullName("Ezequiel (Hernandez Palomero De La Mancha)")).toBe("Ezequiel (Hernandez)");
  });

  it("leaves a name that is already short alone", () => {
    expect(shortenFullName("Fede (Camino)")).toBe("Fede (Camino)");
    expect(shortenFullName("Lucho")).toBe("Lucho");
  });

  it("keeps a compound surname whole", () => {
    expect(shortenFullName("Ezequiel (Di Stefano)")).toBe("Ezequiel (Di Stefano)");
  });
});

describe("countPlaying", () => {
  it("counts a substitute once and leaves a drop-out out", () => {
    const players = [
      { id: "1", name: "Lucho" },
      { id: "2", name: "Mura", isDeleted: true },
      { id: "3", name: "Mauro", isDeleted: false, isReplacedBy: "9" },
    ];

    expect(countPlaying(players)).toBe(2);
  });
});

describe("pricePerPlayer", () => {
  it("divides the pitch by whoever plays, rounding up", () => {
    expect(pricePerPlayer(25000, 12)).toBe(2084);
    expect(pricePerPlayer(24000, 12)).toBe(2000);
  });

  it("has nothing to say without a price or without players", () => {
    expect(pricePerPlayer(null, 12)).toBeNull();
    expect(pricePerPlayer(0, 12)).toBeNull();
    expect(pricePerPlayer(24000, 0)).toBeNull();
  });
});

describe("formatMoney", () => {
  it("writes pesos the way the group does", () => {
    expect(formatMoney(2084).replace(/\s/g, " ")).toBe("$ 2.084");
  });
});

describe("parsePrice", () => {
  it("reads pesos however they are typed", () => {
    expect(parsePrice("24000")).toBe(24000);
    expect(parsePrice("24.000")).toBe(24000);
    expect(parsePrice("$ 24.000")).toBe(24000);
  });

  it("treats an empty box as no price, not zero", () => {
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("  ")).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
  });
});

describe("splitRoster", () => {
  // Letters only: the numbering is a symbol and gets stripped, and so would a digit in a name.
  const NAMES = "Lucho Mura Mauro Lihue Eze Patru Mati Nacho Fede Keis Max Santi Nico Juan".split(" ");
  const fourteen = NAMES.map((name, i) => `${i + 1}. ${name}`).join("\n");

  it("plays the first names up to the cap and keeps the rest waiting, in order", () => {
    const { players, substitutes } = splitRoster(fourteen, 12);

    expect(players).toHaveLength(12);
    expect(substitutes.map((p) => p.name)).toEqual(["Nico", "Juan"]);
  });

  it("plays everyone when there is no cap", () => {
    const { players, substitutes } = splitRoster(fourteen, null);

    expect(players).toHaveLength(14);
    expect(substitutes).toEqual([]);
  });

  it("queues the message's own suplentes behind the ones past the cap", () => {
    const { players, substitutes } = splitRoster("1. Lucho\n2. Mura\n3. Mauro\nSuplentes\n4. Nico", 2);

    expect(players.map((p) => p.name)).toEqual(["Lucho", "Mura"]);
    expect(substitutes.map((p) => p.name)).toEqual(["Mauro", "Nico"]);
  });
});
