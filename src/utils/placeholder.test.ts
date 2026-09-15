import { describe, expect, it } from "vitest";
import { PLACEHOLDER_COUNT, PLACEHOLDER_NAMES, placeholderList, placeholderNames } from "@/utils/placeholder";
import { countPlayers, generatePlayers } from "@/utils";

// Fixed seeds, so a test asks for one particular hand and gets the same one every run.
const day = (seed: number) => seed;

describe("placeholderNames", () => {
  it("deals a different hand on each load", () => {
    const hands = new Set(Array.from({ length: 20 }, () => placeholderNames().join(",")));

    expect(hands.size).toBeGreaterThan(15);
  });

  it("deals the same hand for the same seed, so a test can pin one", () => {
    expect(placeholderNames(1234)).toEqual(placeholderNames(1234));
  });

  it("deals six names", () => {
    expect(placeholderNames(day(260915))).toHaveLength(PLACEHOLDER_COUNT);
  });

  it("never repeats a name in one deal", () => {
    const names = placeholderNames(day(260915));

    expect(new Set(names).size).toBe(names.length);
  });

  /*
    The whole point: over a week or two everyone in the group turns up in the example, so nobody
    reads the box as the app having favourites.
  */
  it("reaches most of the group over a month", () => {
    const seen = new Set(
      Array.from({ length: 30 }, (_, i) => placeholderNames(i)).flat()
    );

    expect(seen.size).toBeGreaterThan(PLACEHOLDER_NAMES.length / 2);
  });

  /*
    The guarantee the uniform draw could not give. The pool is written in the order the names
    arrived — one night's list after another — so a draw that always crosses it always crosses the
    group. Free-drawn, six of thirty-four landed entirely in one third about one day in ten.
  */
  it("always reaches both ends of the pool", () => {
    const third = Math.floor(PLACEHOLDER_NAMES.length / 3);
    const index = (name: string) => PLACEHOLDER_NAMES.indexOf(name);

    for (let day = 0; day < 120; day += 1) {
      const drawn = placeholderNames(day).map(index);

      expect(drawn.some((i) => i < third)).toBe(true);
      expect(drawn.some((i) => i >= PLACEHOLDER_NAMES.length - third)).toBe(true);
    }
  });

  it("leaves nobody out over a month and a half", () => {
    const seen = new Set(
      Array.from({ length: 45 }, (_, i) => placeholderNames(i)).flat()
    );

    expect(seen.size).toBe(PLACEHOLDER_NAMES.length);
  });

  it("takes the whole pool and no more when asked for more than it has", () => {
    const names = placeholderNames(day(260915), PLACEHOLDER_NAMES.length + 5);

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
    expect(countPlayers(placeholderList(day(260915)))).toBe(PLACEHOLDER_COUNT);
  });

  it("numbers the lines from one and leaves the last one open", () => {
    const lines = placeholderList(day(260915)).split("\n");

    expect(lines).toHaveLength(PLACEHOLDER_COUNT);
    expect(lines[0]).toMatch(/^1\. /);
    expect(lines.at(-1)).toMatch(/^6\. .+ \.\.\.$/);
  });
});
