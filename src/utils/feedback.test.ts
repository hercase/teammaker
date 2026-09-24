import { describe, expect, it } from "vitest";
import {
  FEEDBACK_COOLDOWN_MS,
  NUDGED_KEY,
  NUDGE_AFTER_SHARES,
  SHARES_KEY,
  countShareAndShouldNudge,
  isCoolingDown,
} from "./feedback";

const storage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), data };
};

describe("the feedback nudge", () => {
  it("waits for the third share, then asks once and never again", () => {
    const s = storage();
    const answers = Array.from({ length: 6 }, () => countShareAndShouldNudge(s));

    expect(answers.indexOf(true)).toBe(NUDGE_AFTER_SHARES - 1);
    expect(answers.filter(Boolean)).toHaveLength(1);
    expect(s.data.get(SHARES_KEY)).toBe("6");
  });

  it("does not ask someone who was already asked", () => {
    expect(countShareAndShouldNudge(storage({ [SHARES_KEY]: "10", [NUDGED_KEY]: "1" }))).toBe(false);
  });

  it("treats a mangled counter as zero", () => {
    const s = storage({ [SHARES_KEY]: "nope" });
    countShareAndShouldNudge(s);
    expect(s.data.get(SHARES_KEY)).toBe("1");
  });

  it("stays quiet when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("private mode");
      },
      setItem: () => {},
    };
    expect(countShareAndShouldNudge(broken)).toBe(false);
  });
});

describe("the feedback cooldown", () => {
  it("lets the first one through and holds the next for 30 seconds", () => {
    expect(isCoolingDown(null, 1_000)).toBe(false);
    expect(isCoolingDown(1_000, 1_000 + FEEDBACK_COOLDOWN_MS - 1)).toBe(true);
    expect(isCoolingDown(1_000, 1_000 + FEEDBACK_COOLDOWN_MS)).toBe(false);
  });
});
