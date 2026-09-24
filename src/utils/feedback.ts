/*
  Feedback goes to Formspree: a form backend, so the app stays without a server of its own. The
  group sends far fewer than the free plan's 50 a month, and it arrives by email.

  Plain fetch with Accept: application/json is Formspree's documented AJAX path; @formspree/react
  was not added because its useForm owns the form state, and these fields are HeroUI's, controlled.

  The endpoint comes from NEXT_PUBLIC_FORMSPREE_ENDPOINT (.env.local, and the project's variables in
  Vercel). It is not a secret — the browser posts to it, so it ships in the bundle either way — it
  is an environment variable so it can change, or differ per environment, without a commit.

  On localhost the send is simulated even with an endpoint: working on the dialog must not fill the
  inbox or spend the month's 50. Unset in production, the feature is off — no link, no nudge.
*/
export const FEEDBACK_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

export const FEEDBACK_ENABLED = Boolean(FEEDBACK_ENDPOINT) || process.env.NODE_ENV === "development";

export interface Feedback {
  message: string;
  name?: string;
  // Formspree's honeypot: a field only a bot fills. Sent as it is; Formspree drops the submission.
  gotcha?: string;
}

/*
  Spam, by the size of the risk. The endpoint is public like any form's, so a bot can reach it; what
  is at stake is an inbox and the month's 50, not data. Formspree already filters with its own
  model; on top of that the honeypot, the length caps on the fields, and one send per 30 seconds,
  so a double tap or an insistent thumb does not arrive ten times.
*/
export const FEEDBACK_COOLDOWN_MS = 30_000;

export const isCoolingDown = (lastSentAt: number | null, now: number) =>
  lastSentAt !== null && now - lastSentAt < FEEDBACK_COOLDOWN_MS;

export async function sendFeedback({ message, name, gotcha }: Feedback): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return;
  }
  if (!FEEDBACK_ENDPOINT) throw new Error("Feedback has nowhere to go");

  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    // Accept: application/json is what makes Formspree answer with a status instead of a redirect.
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      message,
      name: name?.trim() || undefined,
      _gotcha: gotcha ?? "",
      _subject: "Teammaker: una sugerencia",
      page: window.location.pathname,
    }),
  });

  if (!response.ok) throw new Error(`Formspree answered ${response.status}`);
}

/*
  The one time the app asks rather than waits to be told: after the third picture shared, once.

  The third, not the first, because by then the app has earned an opinion; and after a share
  because that is the moment it has just done its job. Once ever — the mark is set when the nudge
  is shown, not when it is answered, so ignoring it is an answer too.
*/
export const SHARES_KEY = "shares-count";
export const NUDGED_KEY = "feedback-nudged";
export const NUDGE_AFTER_SHARES = 3;

export function countShareAndShouldNudge(storage: Pick<Storage, "getItem" | "setItem">): boolean {
  try {
    const shares = (Number(storage.getItem(SHARES_KEY)) || 0) + 1;
    storage.setItem(SHARES_KEY, String(shares));

    if (shares < NUDGE_AFTER_SHARES || storage.getItem(NUDGED_KEY)) return false;

    storage.setItem(NUDGED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
