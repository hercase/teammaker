import { describe, expect, it } from "vitest";
import { shareCaption } from "./date";

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
