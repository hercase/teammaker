import { MatchEvent, Player } from "@/types";

// \p{L} with the u flag covers accents and ñ, which the previous [a-zA-Z] range stripped
const NON_NAME_CHARS = /[^\p{L}\s]/gu;

/*
  A row is a name at a glance, not a document. These two caps are what still fits on one line of a
  360px phone next to the row menu: "Ezequiel (Hernandez Palomero De La Mancha)" used to push the
  ⋮ clean off the card. The cut happens here, where a Player is made, so the list, the history and
  the screenshot all agree on what someone is called — rename and replace go through the same door.
*/
export const MAX_NAME_CHARS = 14;
export const MAX_DETAILS_CHARS = 18;
export const MAX_FULL_NAME_CHARS = MAX_NAME_CHARS + MAX_DETAILS_CHARS;

/*
  Cut at the last word that fits, so a long surname loses whole words instead of ending mid-
  syllable: "Hernandez Palomero De La Mancha" becomes "Hernandez…", not "Hernandez Palome…". A
  single word longer than the cap has no boundary to fall back on and is cut where it lands.
*/
export function clampName(value: string, max: number): string {
  if (value.length <= max) return value;

  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/*
  Words that are part of the surname that follows them rather than a surname of their own. Without
  them "Ezequiel Di Stefano" would be filed under "Di" and "Nico de la Mancha" under "de".
*/
const SURNAME_PARTICLES = new Set([
  "de",
  "del",
  "della",
  "la",
  "las",
  "los",
  "di",
  "da",
  "das",
  "dos",
  "van",
  "von",
  "der",
  "den",
  "san",
  "santa",
  "mac",
  "mc",
  "st",
  "o",
]);

/*
  The first surname and only the first: it is there to tell two Matis apart, and a row is one line
  wide. "Hernandez Palomero De La Mancha" is filed under Hernandez, while "Di Stefano" and
  "De La Mancha" are single surnames that happen to be spelled in several words, so any leading
  particles are taken along with the word that ends them.
*/
export function firstSurname(words: string[]): string {
  const surname: string[] = [];

  for (const word of words) {
    surname.push(word);

    if (!SURNAME_PARTICLES.has(word.toLowerCase())) break;
  }

  return surname.join(" ");
}

export function generatePlayer(user_str: string): Player {
  const onlyLetters = user_str.replace(NON_NAME_CHARS, "").replace(/\s+/g, " ").trim();
  const [name = "", ...rest] = onlyLetters.split(" ");

  return {
    id: crypto.randomUUID(),
    // clampName is the backstop for the one word that is absurd on its own, not the rule.
    name: clampName(name, MAX_NAME_CHARS),
    details: clampName(firstSurname(rest), MAX_DETAILS_CHARS),
  };
}

/*
  Splits "Nombre (Apellido)" back into its two halves. Both the history migration and the history
  row need it, and it was written out twice before, once in each, which is two places to drift.
*/
export function splitFullName(fullName: string): { name: string; details?: string } {
  const [, name, details] = fullName.match(/^(.*?)\s*\((.+)\)\s*$/) ?? [];

  return details ? { name, details } : { name: fullName };
}

// The first-surname rule applied to a name that was already written out, as an old event stores it.
export function shortenFullName(fullName: string): string {
  const { name, details } = splitFullName(fullName);

  if (!details) return fullName;

  const surname = clampName(firstSurname(details.split(/\s+/)), MAX_DETAILS_CHARS);

  return surname ? `${name} (${surname})` : name;
}

export function generatePlayers(str: string): Player[] {
  return str
    .split("\n")
    .map((line) => generatePlayer(line))
    .filter((player) => player.name !== "");
}

/*
  How many players a pasted list would actually produce, without minting a uuid per line. The list
  box is validated on every keystroke, and it used to count non-blank lines instead — so a list
  padded with emoji or bare numbers passed validation and then produced nothing, leaving the submit
  button looking broken.
*/
export function countPlayers(str: string): number {
  return str.split("\n").filter((line) => line.replace(NON_NAME_CHARS, "").trim() !== "").length;
}

// teamB starts where teamA ends. Using slice(-half) overlaps by one on odd-sized lists.
export function splitTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  const half = Math.ceil(players.length / 2);

  return {
    teamA: players.slice(0, half),
    teamB: players.slice(half),
  };
}

/*
  Two rows that both read "Mati" tell the group nothing about who is on which team, and the data
  has no way to know which Mati is which. Numbering the repeats at least says they are two people;
  renaming one of them from the row menu is what actually fixes it.
*/
export function duplicateTags(labelled: { id: string; label: string }[]): Record<string, number> {
  const counts = new Map<string, number>();

  labelled.forEach(({ label }) => counts.set(label, (counts.get(label) ?? 0) + 1));

  const seen = new Map<string, number>();

  return labelled.reduce<Record<string, number>>((tags, { id, label }) => {
    if ((counts.get(label) ?? 0) < 2) return tags;

    const ordinal = (seen.get(label) ?? 0) + 1;
    seen.set(label, ordinal);

    return { ...tags, [id]: ordinal };
  }, {});
}

export const generateFullName = (player: Player) => `${player.name} ${player.details ? `(${player.details})` : ""}`;

export const validateName = (value: string) => {
  if (!value?.trim()) return "Debes ingresar un nombre";
  if (!/^[\p{L}\s()]+$/u.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
  // Said out loud rather than silently trimmed: a name typed by hand is worth a word of warning.
  if (value.trim().length > MAX_FULL_NAME_CHARS) return `Demasiado largo (máximo ${MAX_FULL_NAME_CHARS} caracteres)`;
};

interface GenerateMatchEvent {
  type: MatchEvent["type"];
  old_player: Player;
  new_player?: Player;
}

export const generateMatchEvent = ({ type, old_player, new_player }: GenerateMatchEvent) => ({
  id: crypto.randomUUID(),
  type,
  old_name: generateFullName(old_player),
  ...(new_player && { new_name: generateFullName(new_player) }),
  date: new Date(),
});
