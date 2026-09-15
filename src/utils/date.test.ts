import { describe, expect, it } from "vitest";
import { proposeKickoff, shareCaption, titleCasePlace } from "./date";

describe("titleCasePlace", () => {
  it("capitalises the pitch the way Spanish writes it", () => {
    expect(titleCasePlace("luro y mexico")).toBe("Luro y Mexico");
    expect(titleCasePlace("QUINTANA Y SALTA")).toBe("Quintana y Salta");
    expect(titleCasePlace("  cancha de la costa  ")).toBe("Cancha de la Costa");
  });
});

describe("shareCaption", () => {
  const date = "2026-09-16T18:30";

  it("reads as a heading the group can scan, with place and weekday capitalised", () => {
    expect(shareCaption("luro y mexico", "2026-09-15T19:30", 2000)).toBe(
      "Luro y Mexico · Martes 15/09 19:30hs · $ 2.000 c/u"
    );
  });

  it("leaves out whatever the match does not have yet", () => {
    expect(shareCaption("Quintana y Salta", date)).toBe("Quintana y Salta · Miércoles 16/09 18:30hs");
    expect(shareCaption("", date, 2000)).toBe("Miércoles 16/09 18:30hs · $ 2.000 c/u");
    expect(shareCaption("Quintana y Salta", null)).toBe("Quintana y Salta");
    expect(shareCaption("", null)).toBe("Equipos");
  });
});

describe("proposeKickoff", () => {
  // A Sunday morning; the last match was the Wednesday before, at 18:30.
  const now = new Date(2026, 8, 13, 11, 0);

  it("proposes the same weekday and hour, the coming week", () => {
    expect(proposeKickoff("2026-09-09T18:30", now)).toBe("2026-09-16T18:30");
  });

  it("accepts the Date an older save left in the store", () => {
    expect(proposeKickoff(new Date(2026, 8, 8, 20, 0), now)).toBe("2026-09-15T20:00");
  });

  it("proposes nothing before there has been a match", () => {
    expect(proposeKickoff(null, now)).toBeUndefined();
    expect(proposeKickoff("no es una fecha", now)).toBeUndefined();
  });
});
