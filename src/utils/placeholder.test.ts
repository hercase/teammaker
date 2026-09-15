import { describe, expect, it } from "vitest";
import { PLACEHOLDER_COUNT, PLACEHOLDER_NAMES, placeholderList, placeholderNames } from "@/utils/placeholder";
import { countPlayers, generatePlayers } from "@/utils";

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date, 12, 0);

describe("placeholderNames", () => {
  it("deals six names", () => {
    expect(placeholderNames(day(2026, 9, 15))).toHaveLength(PLACEHOLDER_COUNT);
  });

  it("never repeats a name in one deal", () => {
    const names = placeholderNames(day(2026, 9, 15));

    expect(new Set(names).size).toBe(names.length);
  });

  // The box re-renders on every keystroke, and a placeholder that moved under the cursor would read
  // as the box doing something on its own.
  it("deals the same hand all day", () => {
    expect(placeholderNames(day(2026, 9, 15))).toEqual(placeholderNames(new Date(2026, 8, 15, 23, 59)));
  });

  it("deals a different hand the next day", () => {
    expect(placeholderNames(day(2026, 9, 15))).not.toEqual(placeholderNames(day(2026, 9, 16)));
  });

  /*
    The whole point: over a week or two everyone in the group turns up in the example, so nobody
    reads the box as the app having favourites.
  */
  it("reaches most of the group over a month", () => {
    const seen = new Set(
      Array.from({ length: 30 }, (_, i) => placeholderNames(day(2026, 9, 1 + i))).flat()
    );

    expect(seen.size).toBeGreaterThan(PLACEHOLDER_NAMES.length / 2);
  });

  it("takes the whole pool and no more when asked for more than it has", () => {
    const names = placeholderNames(day(2026, 9, 15), PLACEHOLDER_NAMES.length + 5);

    expect(names).toHaveLength(PLACEHOLDER_NAMES.length);
    expect(new Set(names).size).toBe(PLACEHOLDER_NAMES.length);
  });
});

describe("PLACEHOLDER_NAMES", () => {
  it("has no repeats, whatever the pool was written with", () => {
    const keys = PLACEHOLDER_NAMES.map((name) => name.toLowerCase());

    expect(new Set(keys).size).toBe(keys.length);
  });

  /*
    First names only. A surname in the example reads as a rule about how the list has to be written,
    and it is not one: the bracketed half exists to tell two Fedes apart, nothing more.
  */
  it("carries no compound names", () => {
    expect(PLACEHOLDER_NAMES.filter((name) => name.includes(" "))).toEqual([]);
  });

  it("is every one a name the app can actually parse", () => {
    expect(generatePlayers(PLACEHOLDER_NAMES.join("\n"))).toHaveLength(PLACEHOLDER_NAMES.length);
  });
});

describe("placeholderList", () => {
  /*
    The example has to be in the format the box expects, or it teaches the wrong thing: a numbered
    line is what parseMessage reads as a player.
  */
  it("is a list this app would read as six players", () => {
    expect(countPlayers(placeholderList(day(2026, 9, 15)))).toBe(PLACEHOLDER_COUNT);
  });

  it("numbers the lines from one and leaves the last one open", () => {
    const lines = placeholderList(day(2026, 9, 15)).split("\n");

    expect(lines).toHaveLength(PLACEHOLDER_COUNT);
    expect(lines[0]).toMatch(/^1\. /);
    expect(lines.at(-1)).toMatch(/^6\. .+ \.\.\.$/);
  });
});
