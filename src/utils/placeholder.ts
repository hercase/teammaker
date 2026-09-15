/*
  The example list in the empty box. It used to be five names hardcoded into the placeholder, and
  they were always the same five — which in a group where everyone reads the same screen looks
  like the app has favourites. So the six it shows are dealt from the whole group, and the deal
  changes every day: nobody is the example twice in a row, and nobody is never the example.

  A fresh six on every load. What must not happen is a reshuffle while someone is reading or
  pasting over it, and that is the component's job: it memoises the call, so the deal happens once
  per mount and then holds. Seeded rather than reaching for Math.random inside the shuffle, so a
  test can ask for one particular hand and get it every time.
*/

/*
  Names the group actually uses, from their own lists. Repeats are dropped below rather than here,
  so the same name can be pasted in twice from two different messages without anyone noticing.

  First names only: a "Fede Camino" in the example reads as a rule about how to write the list,
  and it is not one — the surname is only ever there to tell two Fedes apart.
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
  "Fede",
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
  "Gonza",
  "Ale",
  "Maci",
  "Joel",
  "Nata",
  "Andres",
  "Pablo",
  "Kun",
  "Agustín",
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

/* mulberry32: small, seeded, and good enough to deal six names out of thirty-four. */
const random = (seed: number) => () => {
  // | 0 on every step: without it the seed drifts past 32 bits and stops being the integer the
  // rest of the arithmetic assumes.
  let state = (seed = (seed + 0x6d2b79f5) | 0);

  state = Math.imul(state ^ (state >>> 15), 1 | state);
  state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);

  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
};

// A different hand every time the form is opened. Callers that need a fixed one pass their own.
const freshSeed = (): number => Math.floor(Math.random() * 2 ** 31);

/*
  One name out of each equal slice of the pool, then the six shuffled into a reading order.

  A plain uniform draw was the first version and it was not wrong — measured against a real
  shuffle it came out identical. It was just not what the box needed: six names taken freely out
  of thirty-four land all in the same corner of the list about one day in ten, and the pool is
  written down in the order the names arrived, one night's list after another. So one day in ten
  the example was a photograph of a single Tuesday, which is exactly what it exists not to be.

  Slicing first makes spanning the roster a guarantee instead of a hope, and it costs nothing:
  the slices are disjoint, so nobody can be drawn twice, and within a slice the pick is still
  uniform. It also evens out how often each name appears, because a name now competes with its
  own five neighbours rather than with the whole list.

  The one thing it asks in return: NAMES stays grouped by where each name came from. Append a new
  night's list at the end rather than sprinkling it in, or the slices stop meaning anything.
*/
export function placeholderNames(seed: number = freshSeed(), count: number = PLACEHOLDER_COUNT): string[] {
  const pool = PLACEHOLDER_NAMES;
  const draw = Math.max(0, Math.min(count, pool.length));

  if (draw === 0) return [];

  const next = random(seed);
  const picked = Array.from({ length: draw }, (_, slice) => {
    const start = Math.floor((slice * pool.length) / draw);
    const end = Math.floor(((slice + 1) * pool.length) / draw);

    return pool[start + Math.floor(next() * (end - start))];
  });

  /*
    Shuffled after the fact, or the example would always run down the pool in order and the first
    line would only ever be somebody from the oldest list.
  */
  for (let i = picked.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));

    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
}

/*
  Numbered the way the group numbers them, because a numbered line is what parseMessage reads as a
  player — the example in the box is the format the box expects. The trailing "…" says the real
  thing is longer than six.
*/
export function placeholderList(seed: number = freshSeed()): string {
  return placeholderNames(seed)
    .map((name, index) => `${index + 1}. ${name}`)
    .join("\n")
    .concat(" ...");
}
