import { describe, expect, it } from "vitest";
import { proposeKickoff, shareCaption } from "./date";

describe("shareCaption", () => {
  const date = "2026-09-16T18:30";

  it("reads as a sentence to the group, not as a heading", () => {
    expect(shareCaption("Quintana y Salta", date)).toBe(
      "Equipos para el miércoles 16/09 a las 18:30 hs en Quintana y Salta"
    );
  });

  it("leaves out whatever the match does not have yet", () => {
    expect(shareCaption("", date)).toBe("Equipos para el miércoles 16/09 a las 18:30 hs");
    expect(shareCaption("Quintana y Salta", null)).toBe("Equipos en Quintana y Salta");
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
