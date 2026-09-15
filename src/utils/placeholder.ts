/*
  The example list in the empty box. It used to be five names hardcoded into the placeholder, and
  they were always the same five — which in a group where everyone reads the same screen looks
  like the app has favourites. So the six it shows are dealt from the whole group, and the deal
  changes every day: nobody is the example twice in a row, and nobody is never the example.

  Deterministic, not random: everyone opening the link on a Tuesday sees the same six, and the box
  does not reshuffle its own placeholder on every keystroke. The component still memoises it, but
  the guarantee lives here.
*/

/*
  Names the group actually uses, from their own lists. Repeats are dropped below rather than here,
  so the same name can be pasted in twice from two different messages without anyone noticing.
  One name carries a surname on purpose: it is the shape that shows the "(Camino)" rule exists.
*/
const NAMES = [
  "Lucho",
  "Mura",
  "Mauro",
  "Lihue",
  "Eze",
  "Patru",
  "Mati",
  "Nacho",
  "Fede Camino",
  "Keis",
  "Max",
  "Oski",
  "Willy",
  "Pela",
  "Juan",
  "Charly",
  "Marcos",
  "Rubio",
  "Fran",
  "Sera",
  "Igna",
  "Joaco",
  "Inti",
  "Jorge",
  "Oveja",
  "Gonzalo",
  "Ale",
  "Maci",
  "Joel",
  "Nata",
];

/*
  Case-insensitive, because the same person arrives as "joaco" in one message and "Joaco" in the
  next, and two rows of the same name in a six-name example is exactly what this is meant to avoid.
  The first spelling wins, so the pool above decides how a name is written.
*/
const dedupe = (names: string[]): string[] => {
  const seen = new Set<string>();

  return names.filter((name) => {
    const key = name.trim().toLowerCase();

    if (!key || seen.has(key)) return false;

    seen.add(key);

    return true;
  });
};

export const PLACEHOLDER_NAMES = dedupe(NAMES);

export const PLACEHOLDER_COUNT = 6;

/*
  mulberry32. A seeded generator rather than Math.random because the same day has to deal the same
  hand: the placeholder is read while someone is pasting over it, and a list that reshuffled under
  the cursor would read as the box doing something.
*/
const random = (seed: number) => () => {
  // | 0 on every step: without it the seed drifts past 32 bits and stops being the integer the
  // rest of the arithmetic assumes.
  let state = (seed = (seed + 0x6d2b79f5) | 0);

  state = Math.imul(state ^ (state >>> 15), 1 | state);
  state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);

  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
};

// The local calendar day, so the deal turns over at midnight where the person is, not in UTC.
const daySeed = (date: Date): number => date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

/*
  Fisher-Yates, stopped once enough names are drawn: a partial shuffle picks without replacement,
  so the six are always six different people however small the pool gets.
*/
export function placeholderNames(date: Date = new Date(), count: number = PLACEHOLDER_COUNT): string[] {
  const pool = [...PLACEHOLDER_NAMES];
  const next = random(daySeed(date));
  const draw = Math.max(0, Math.min(count, pool.length));

  for (let i = 0; i < draw; i += 1) {
    const j = i + Math.floor(next() * (pool.length - i));

    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, draw);
}

/*
  Numbered the way the group numbers them, because a numbered line is what parseMessage reads as a
  player — the example in the box is the format the box expects. The trailing "…" says the real
  thing is longer than six.
*/
export function placeholderList(date: Date = new Date()): string {
  return placeholderNames(date)
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n")
    .concat(" ...");
}
