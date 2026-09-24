import { afterEach, describe, expect, it, vi } from "vitest";
import { LEGACY_HOST, MOVED_NOTICE_KEY, STORAGE_KEYS, URL_BASE, handoffScript } from "./site";

interface FakeWindow {
  location: { hostname: string; pathname: string; search: string; hash: string; replace: (url: string) => void };
  localStorage: Storage;
  history: { replaceState: (data: unknown, unused: string, url: string) => void };
}

const storage = (initial: Record<string, string> = {}): Storage => {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
};

/* Runs the script exactly as the page does: the serialised string, not the imported function. */
const run = (url: string, saved: Record<string, string> = {}) => {
  const { hostname, pathname, search, hash } = new URL(url);
  const out = { redirectedTo: null as string | null, cleanedTo: null as string | null };
  const win: FakeWindow = {
    location: { hostname, pathname, search, hash, replace: (u) => (out.redirectedTo = u) },
    localStorage: storage(saved),
    history: { replaceState: (_d, _u, u) => (out.cleanedTo = u) },
  };
  vi.stubGlobal("window", win);
  new Function(handoffScript())();
  return { ...out, storage: win.localStorage };
};

const MATCH = JSON.stringify({ state: { location: "Quintana y Salta" }, version: 0 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("handoff to the new domain", () => {
  it("carries what the old host saved, and the path, to the new one", () => {
    const { redirectedTo } = run(`https://${LEGACY_HOST}/match`, { "match-store": MATCH, unrelated: "x" });

    expect(redirectedTo).toMatch(new RegExp(`^${URL_BASE}/match#handoff=`));
    const carried = JSON.parse(decodeURIComponent(redirectedTo!.split("#handoff=")[1]));
    expect(carried).toEqual({ "match-store": MATCH });
  });

  it("still marks the arrival when there is nothing to carry", () => {
    const from = run(`https://${LEGACY_HOST}/`);
    expect(from.redirectedTo).toBe(`${URL_BASE}/#handoff=${encodeURIComponent("{}")}`);
    expect(run(from.redirectedTo!).storage.getItem(MOVED_NOTICE_KEY)).toBe("arrived");
  });

  it("writes the carried stores on the new host and strips the fragment", () => {
    const from = run(`https://${LEGACY_HOST}/match`, { "match-store": MATCH });
    const to = run(from.redirectedTo!);

    expect(to.storage.getItem("match-store")).toBe(MATCH);
    expect(to.storage.getItem(MOVED_NOTICE_KEY)).toBe("carried");
    expect(to.cleanedTo).toBe("/match");
    expect(to.redirectedTo).toBeNull();
  });

  it("never overwrites what the new host already has", () => {
    const from = run(`https://${LEGACY_HOST}/`, { "match-store": MATCH });
    const mine = JSON.stringify({ state: { location: "Otra cancha" }, version: 0 });

    expect(run(from.redirectedTo!, { "match-store": mine }).storage.getItem("match-store")).toBe(mine);
  });

  it("takes only the known keys, only as JSON objects, from a crafted link", () => {
    const crafted = { "players-store": "not json", "match-store": "42", evil: JSON.stringify({ a: 1 }) };
    const { storage: s, cleanedTo } = run(`${URL_BASE}/#handoff=${encodeURIComponent(JSON.stringify(crafted))}`);

    for (const key of [...STORAGE_KEYS, "evil"]) expect(s.getItem(key)).toBeNull();
    expect(cleanedTo).toBe("/");
  });

  it("does not bring the notice back once it has been seen", () => {
    const from = run(`https://${LEGACY_HOST}/`, { "match-store": MATCH });
    expect(run(from.redirectedTo!, { [MOVED_NOTICE_KEY]: "seen" }).storage.getItem(MOVED_NOTICE_KEY)).toBe("seen");
  });

  it("leaves an ordinary visit to the new host alone", () => {
    const r = run(`${URL_BASE}/match`);
    expect(r.redirectedTo).toBeNull();
    expect(r.cleanedTo).toBeNull();
  });
});
