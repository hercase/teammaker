import { describe, expect, it } from "vitest";
import {
  DEFAULT_KIT,
  KIT_PRESETS,
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
      teamA: "white",
      teamB: "blue",
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

  it("rejects a shirts kit whose colours are not presets", () => {
    expect(parseKit({ mode: "shirts", teamA: "fucsia", teamB: "blue" })).toEqual(DEFAULT_KIT);
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

  it("names the shirt colour", () => {
    const kit = { mode: "shirts", teamA: "red", teamB: "black" } as const;

    expect(kitLabel(kit, "A")).toBe("Roja");
    expect(kitLabel(kit, "B")).toBe("Negra");
  });
});

describe("kitColor", () => {
  it("gives the two sides different colours in bibs mode", () => {
    const kit = { mode: "bibs", bibTeam: "A" } as const;

    expect(kitColor(kit, "A")).not.toBe(kitColor(kit, "B"));
  });

  it("resolves a preset to its hex", () => {
    expect(kitColor({ mode: "shirts", teamA: "green", teamB: "yellow" }, "A")).toBe(KIT_PRESETS.green.hex);
  });
});

describe("setShirt", () => {
  const kit = { mode: "shirts", teamA: "white", teamB: "blue" } as const;

  it("changes only the team you picked when the colour is free", () => {
    expect(setShirt(kit, "A", "red")).toEqual({ mode: "shirts", teamA: "red", teamB: "blue" });
  });

  it("swaps the kits when you pick what the other team is wearing", () => {
    expect(setShirt(kit, "A", "blue")).toEqual({ mode: "shirts", teamA: "blue", teamB: "white" });
    expect(setShirt(kit, "B", "white")).toEqual({ mode: "shirts", teamA: "blue", teamB: "white" });
  });

  it("never leaves both teams in the same shirt", () => {
    const sides = ["A", "B"] as const;

    sides.forEach((side) =>
      (["white", "black", "celeste", "blue", "red", "green", "yellow"] as const).forEach((color) => {
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
    expect(kit.teamA).toBe("blue");
    expect(kit.teamB).not.toBe("blue");
  });

  it("moves the second team off a colour that persisted JSON repeated", () => {
    const kit = parseKit({ mode: "shirts", teamA: "red", teamB: "red" });

    expect(kit.mode).toBe("shirts");
    if (kit.mode !== "shirts") return;
    expect(kit.teamA).toBe("red");
    expect(kit.teamB).not.toBe("red");
  });

  it("leaves a kit with two different colours alone", () => {
    expect(parseKit({ mode: "shirts", teamA: "white", teamB: "black" })).toEqual({
      mode: "shirts",
      teamA: "white",
      teamB: "black",
    });
  });
});

describe("teamPhrase", () => {
  it("says the team the way the sideline does", () => {
    expect(teamPhrase({ mode: "shades", lightTeam: "A" }, "B")).toBe("los de oscuro");
    expect(teamPhrase({ mode: "shades", lightTeam: "A" }, "A")).toBe("los de claro");
    expect(teamPhrase({ mode: "shirts", teamA: "white", teamB: "blue" }, "B")).toBe("los de azul");
    expect(teamPhrase({ mode: "shirts", teamA: "red", teamB: "yellow" }, "A")).toBe("los de rojo");
    expect(teamPhrase({ mode: "bibs", bibTeam: "A" }, "B")).toBe("el equipo B");
  });
});
