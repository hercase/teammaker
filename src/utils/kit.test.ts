import { describe, expect, it } from "vitest";
import {
  DEFAULT_KIT,
  KIT_PRESETS,
  PRESET_COLORS,
  kitColor,
  kitLabel,
  migrateColorsToKit,
  nearestPreset,
  parseKit,
  setShirt,
  teamPhrase,
} from "@/utils/kit";

describe("nearestPreset", () => {
  it("maps the old defaults to the presets they were standing in for", () => {
    expect(nearestPreset("#e3e3e3")).toBe("white");
    expect(nearestPreset("#151d65")).toBe("blue");
  });

  it("decides nearly greyscale colours by lightness", () => {
    expect(nearestPreset("#111111")).toBe("black");
    expect(nearestPreset("#f4f4f4")).toBe("white");
  });

  it("keeps a saturated colour on its own hue", () => {
    expect(nearestPreset("#b91c1c")).toBe("red");
    expect(nearestPreset("#065f46")).toBe("green");
    expect(nearestPreset("#fcd34d")).toBe("yellow");
  });

  it("falls back to white for anything that is not a colour", () => {
    expect(nearestPreset(undefined)).toBe("white");
    expect(nearestPreset("no soy un color")).toBe("white");
  });
});

describe("migrateColorsToKit", () => {
  it("turns a match saved before the kit existed into a shirts kit", () => {
    expect(migrateColorsToKit({ teamA: "#e3e3e3", teamB: "#151d65" })).toEqual({
      mode: "shirts",
      teamA: KIT_PRESETS.white.hex,
      teamB: KIT_PRESETS.blue.hex,
    });
  });

  it("falls back to the default when there is nothing to migrate", () => {
    expect(migrateColorsToKit(undefined)).toEqual(DEFAULT_KIT);
  });
});

describe("parseKit", () => {
  it("keeps a valid bibs kit", () => {
    expect(parseKit({ mode: "bibs", bibTeam: "B" })).toEqual({ mode: "bibs", bibTeam: "B" });
  });

  it("rejects a shirts kit whose colours are not colours", () => {
    expect(parseKit({ mode: "shirts", teamA: "fucsia mate", teamB: "#6085ee" })).toEqual(DEFAULT_KIT);
  });

  /*
    A shirt is any hex now, so the check is that it reads as a colour rather than that it is one of
    seven. Spellings are normalised, or the same shirt written two ways would not compare equal and
    the two-teams-one-shirt rule would stop catching it.
  */
  it("keeps a shirts kit in colours nobody picked from a list", () => {
    expect(parseKit({ mode: "shirts", teamA: "#FF00AA", teamB: "rebeccapurple" })).toEqual({
      mode: "shirts",
      teamA: "#ff00aa",
      teamB: "#663399",
    });
  });

  it("rejects a bibs kit without a team", () => {
    expect(parseKit({ mode: "bibs" })).toEqual(DEFAULT_KIT);
  });

  it("rejects junk left in localStorage", () => {
    expect(parseKit(null)).toEqual(DEFAULT_KIT);
    expect(parseKit("bibs")).toEqual(DEFAULT_KIT);
    expect(parseKit({ mode: "shorts" })).toEqual(DEFAULT_KIT);
  });
});

describe("kitLabel", () => {
  it("titles both panels A and B in bibs mode, since neither header carries a garment", () => {
    const kit = { mode: "bibs", bibTeam: "A" } as const;

    expect(kitLabel(kit, "A")).toBe("Equipo A");
    expect(kitLabel(kit, "B")).toBe("Equipo B");
  });

  /*
    A colour off the swatches has no name, so the panel is titled the way bibs mode titles both of
    its own: naming a teal "Verde" because green is the nearest of six would be a title nobody
    chose and nobody can correct.
  */
  it("titles the team when the shirt is not one of the named colours", () => {
    const kit = { mode: "shirts", teamA: "#1fa2a2", teamB: KIT_PRESETS.red.hex } as const;

    expect(kitLabel(kit, "A")).toBe("Equipo A");
    expect(kitLabel(kit, "B")).toBe("Roja");
  });

  it("names the shirt colour", () => {
    const kit = { mode: "shirts", teamA: KIT_PRESETS.red.hex, teamB: KIT_PRESETS.black.hex } as const;

    expect(kitLabel(kit, "A")).toBe("Roja");
    expect(kitLabel(kit, "B")).toBe("Negra");
  });
});

describe("kitColor", () => {
  it("gives the two sides different colours in bibs mode", () => {
    const kit = { mode: "bibs", bibTeam: "A" } as const;

    expect(kitColor(kit, "A")).not.toBe(kitColor(kit, "B"));
  });

  it("gives back the shirt it was told", () => {
    expect(kitColor({ mode: "shirts", teamA: "#123456", teamB: KIT_PRESETS.yellow.hex }, "A")).toBe("#123456");
  });
});

describe("setShirt", () => {
  const kit = { mode: "shirts", teamA: KIT_PRESETS.white.hex, teamB: KIT_PRESETS.blue.hex } as const;

  it("changes only the team you picked when the colour is free", () => {
    expect(setShirt(kit, "A", "#123456")).toEqual({
      mode: "shirts",
      teamA: "#123456",
      teamB: KIT_PRESETS.blue.hex,
    });
  });

  it("swaps the kits when you pick what the other team is wearing", () => {
    expect(setShirt(kit, "A", KIT_PRESETS.blue.hex)).toEqual({
      mode: "shirts",
      teamA: KIT_PRESETS.blue.hex,
      teamB: KIT_PRESETS.white.hex,
    });
    expect(setShirt(kit, "B", KIT_PRESETS.white.hex)).toEqual({
      mode: "shirts",
      teamA: KIT_PRESETS.blue.hex,
      teamB: KIT_PRESETS.white.hex,
    });
  });

  it("never leaves both teams in the same shirt", () => {
    const sides = ["A", "B"] as const;

    sides.forEach((side) =>
      /* The seven swatches and a hex nobody offered: both have to obey the rule. */
      [...PRESET_COLORS.map((preset) => KIT_PRESETS[preset].hex), "#123456"].forEach((color) => {
        const next = setShirt(kit, side, color);

        expect(next.teamA).not.toBe(next.teamB);
      })
    );
  });
});

describe("kit de claras contra oscuras", () => {
  const kit = { mode: "shades", lightTeam: "A" } as const;

  it("names the two sides by their shade instead of a colour", () => {
    expect(kitLabel(kit, "A")).toBe("Claras");
    expect(kitLabel(kit, "B")).toBe("Oscuras");
  });

  it("gives both sides a colour, unlike bibs where only one team wears something", () => {
    expect(kitColor(kit, "A")).not.toBeNull();
    expect(kitColor(kit, "B")).not.toBeNull();
    expect(kitColor(kit, "A")).not.toBe(kitColor(kit, "B"));
  });

  it("survives a round trip through the persisted store", () => {
    expect(parseKit({ mode: "shades", lightTeam: "B" })).toEqual({ mode: "shades", lightTeam: "B" });
  });

  it("falls back to the default when the light team is missing", () => {
    expect(parseKit({ mode: "shades" })).toEqual(DEFAULT_KIT);
  });
});

/*
  Both teams in the same shirt is the one thing the screen must never say, and neither of the two
  ways a kit arrives from outside the app can promise it on its own.
*/
describe("two teams never wear the same shirt", () => {
  it("moves the second team off a colour that migration mapped twice", () => {
    const kit = migrateColorsToKit({ teamA: "#4f7cff", teamB: "#2f5fe0" });

    expect(kit.mode).toBe("shirts");
    if (kit.mode !== "shirts") return;
    expect(kit.teamA).toBe(KIT_PRESETS.blue.hex);
    expect(kit.teamB).not.toBe(KIT_PRESETS.blue.hex);
  });

  it("moves the second team off a colour that persisted JSON repeated", () => {
    const kit = parseKit({ mode: "shirts", teamA: "#e8505e", teamB: "#E8505E" });

    expect(kit.mode).toBe("shirts");
    if (kit.mode !== "shirts") return;
    // Normalised first, or the same shirt spelled two ways would slip past the rule.
    expect(kit.teamA).toBe("#e8505e");
    expect(kit.teamB).not.toBe("#e8505e");
  });

  it("leaves a kit with two different colours alone", () => {
    expect(parseKit({ mode: "shirts", teamA: KIT_PRESETS.white.hex, teamB: KIT_PRESETS.black.hex })).toEqual({
      mode: "shirts",
      teamA: KIT_PRESETS.white.hex,
      teamB: KIT_PRESETS.black.hex,
    });
  });
});

describe("teamPhrase", () => {
  it("says the team the way the sideline does", () => {
    expect(teamPhrase({ mode: "shades", lightTeam: "A" }, "B")).toBe("los de oscuro");
    expect(teamPhrase({ mode: "shades", lightTeam: "A" }, "A")).toBe("los de claro");
    expect(teamPhrase({ mode: "shirts", teamA: KIT_PRESETS.white.hex, teamB: KIT_PRESETS.blue.hex }, "B")).toBe(
      "los de azul"
    );
    // A colour nobody offered is spoken about as the team, not as a colour it only resembles.
    expect(teamPhrase({ mode: "shirts", teamA: "#b91c1c", teamB: KIT_PRESETS.yellow.hex }, "A")).toBe("el equipo A");
    expect(teamPhrase({ mode: "shirts", teamA: KIT_PRESETS.red.hex, teamB: KIT_PRESETS.yellow.hex }, "A")).toBe(
      "los de rojo"
    );
    expect(teamPhrase({ mode: "bibs", bibTeam: "A" }, "B")).toBe("el equipo B");
  });
});
