/*
  Where the app lives. metadataBase, the canonical, the sitemap and the structured data all read it,
  so moving the app is this one line.
*/
export const URL_BASE = "https://teammaker.com.ar";

/* Where it lived until September 2026, and where the link in the group description still points. */
export const LEGACY_HOST = "teammaker.vercel.app";

/* Everything the app keeps, by the names the zustand stores persist under. */
export const STORAGE_KEYS = ["match-store", "players-store"] as const;

const HANDOFF = "#handoff=";

/*
  Set by the handoff on arrival, read by MovedNotice: "carried" when something came across, "arrived"
  when the old host had nothing to bring, "seen" once the notice has been dismissed. Never carried
  itself — it is about this host, not the old one.
*/
export const MOVED_NOTICE_KEY = "moved-notice";
export type MovedNotice = "carried" | "arrived" | "seen";

/*
  Moving domains without leaving anyone's match behind.

  localStorage belongs to an origin, so a plain redirect from the old host would land every phone on
  the new one with nothing in it: the match someone opened on Tuesday gone, the saved name gone, the
  kit back to its default. A server redirect cannot help, because the server never sees
  localStorage. So the old host redirects from the browser instead, carrying what it holds in the
  fragment — which never reaches a server either — and the new host writes it back before the
  stores read it.

  It runs as an inline script in <head>, ahead of the bundle, because zustand's persist reads
  localStorage the moment a store is created; written any later, the stores would already have
  hydrated empty. That is also why it is written as one self-contained function with no imports:
  it is serialised with toString() and its arguments passed in.

  The fragment is untrusted — anyone can craft a link with one — so only the known keys are taken,
  only as JSON objects, and never over anything already saved on this host. The stores distrust
  what they rehydrate on top of that (parseKit, the migrations).
*/
export function handoff(
  legacyHost: string,
  target: string,
  keys: readonly string[],
  marker: string,
  noticeKey: string
) {
  try {
    const { hostname, pathname, search, hash } = window.location;

    if (hostname === legacyHost) {
      const carried: Record<string, string> = {};
      for (const key of keys) {
        const value = window.localStorage.getItem(key);
        if (value !== null) carried[key] = value;
      }
      // Always a fragment, even an empty one: it is also how the new host knows someone came from here.
      window.location.replace(target + pathname + search + marker + encodeURIComponent(JSON.stringify(carried)));
      return;
    }

    if (!hash.startsWith(marker)) return;

    let wrote = false;
    const carried: unknown = JSON.parse(decodeURIComponent(hash.slice(marker.length)));
    if (carried && typeof carried === "object") {
      for (const key of keys) {
        const value = (carried as Record<string, unknown>)[key];
        if (typeof value !== "string" || window.localStorage.getItem(key) !== null) continue;
        try {
          const parsed: unknown = JSON.parse(value);
          if (parsed && typeof parsed === "object") {
            window.localStorage.setItem(key, value);
            wrote = true;
          }
        } catch {
          // One bad value does not cost the others.
        }
      }
    }
    if (window.localStorage.getItem(noticeKey) !== "seen") {
      window.localStorage.setItem(noticeKey, wrote ? "carried" : "arrived");
    }
    window.history.replaceState(null, "", pathname + search);
  } catch {
    // Private mode, a mangled fragment, a full quota: the app still opens, just without the carry.
  }
}

export const handoffScript = () =>
  `(${handoff.toString()})(${JSON.stringify(LEGACY_HOST)},${JSON.stringify(URL_BASE)},${JSON.stringify(
    STORAGE_KEYS
  )},${JSON.stringify(HANDOFF)},${JSON.stringify(MOVED_NOTICE_KEY)})`;
