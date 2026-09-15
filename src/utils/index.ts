import { MatchEvent, Player } from "@/types";
import { parseMessage } from "@/utils/message";

// \p{L} with the u flag covers accents and ñ, which the previous [a-zA-Z] range stripped
const NON_NAME_CHARS = /[^\p{L}\s]/gu;

/*
  crypto.randomUUID only exists in a secure context, and http://<ip-de-la-lan>:3000 is not one —
  which is exactly how this app gets opened on a phone to try it out. There it threw, so creating
  the teams did nothing at all and the button looked dead. These ids never leave the browser: they
  key React lists and identify a player inside one saved match, so Math.random is enough when the
  real thing is unavailable.
*/
export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

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
  // Not a surname particle but a nickname's: "Andres (el titan)" is filed under "el titan", not "el".
  "el",
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
  // Replaced with a space, not removed: "Andres(el titan)" used to come out as "Andresel titan".
  const onlyLetters = user_str.replace(NON_NAME_CHARS, " ").replace(/\s+/g, " ").trim();
  const [name = "", ...rest] = onlyLetters.split(" ");

  return {
    id: uid(),
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

const toPlayers = (lines: string[]): Player[] =>
  lines.map((line) => generatePlayer(line)).filter((player) => player.name !== "");

// Only the player lines of the message; see parseMessage for what the rest of it is.
export function generatePlayers(str: string): Player[] {
  return toPlayers(parseMessage(str).players);
}

/*
  What the form proposes before anyone has said: six a side. Cleared, it means everyone plays.
*/
export const DEFAULT_CAPACITY = 12;

/*
  Who plays and who waits. The cap comes first: a Tuesday list of fourteen with a cap of twelve
  is twelve players and two substitutes, in list order, which is the order they signed up in and
  the order they expect to get a spot. Whoever the message listed under "Suplentes" waits behind
  them. Without a cap every numbered name plays, as before.
*/
export function splitRoster(str: string, capacity: number | null): { players: Player[]; substitutes: Player[] } {
  const parsed = parseMessage(str);
  const all = toPlayers(parsed.players);
  // A cap under two is not a match; it is treated as no cap rather than as a silent refusal.
  const cut = capacity && capacity >= 2 ? Math.min(capacity, all.length) : all.length;

  return {
    players: all.slice(0, cut),
    substitutes: [...all.slice(cut), ...toPlayers(parsed.substitutes)],
  };
}

/*
  Who is actually on the pitch: a row that is out is out, whoever it shows — the player who signed
  up, or the substitute who came in for them and then dropped out too. A replaced row counts once,
  as its substitute. The team header, the "falta uno" line and the price per head all need the
  same number, so it is decided here.
*/
export function countPlaying(players: Player[]): number {
  return players.filter((player) => !player.isDeleted).length;
}

/*
  How many players a pasted list would actually produce, without minting a uuid per line. The list
  box is validated on every keystroke, and it used to count non-blank lines instead — so a list
  padded with emoji or bare numbers passed validation and then produced nothing, leaving the submit
  button looking broken.
*/
export function countPlayers(str: string): number {
  return parseMessage(str).players.filter((line) => line.replace(NON_NAME_CHARS, "").trim() !== "").length;
}

/*
  The draw: the first half of the list is team A, the rest team B, and the odd one out goes to A.
  It happens once, when the match starts — from then on the side is a fact written on the row.
*/
export function assignTeams(players: Player[]): Player[] {
  const half = Math.ceil(players.length / 2);

  return players.map((player, index): Player => ({ ...player, team: index < half ? "A" : "B" }));
}

/*
  Reads the side off the row; it is not recomputed from the list. It used to be — team A was the
  first ceil(n/2) rows — which meant the split point moved whenever the list grew, so adding a
  player to the smaller side pushed somebody across to the bigger one: a 5v5 plus one for Oscuras
  came out 6v4, with Keis on the wrong team. A list where |A| = |B| + 1 is the only shape that
  rule could express, and Sumar jugador exists precisely to break it.

  Anything without a side reads as A, so a row that somehow escaped the draw still gets drawn
  rather than disappearing off the screen.
*/
export function splitTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  return {
    teamA: players.filter((player) => player.team !== "B"),
    teamB: players.filter((player) => player.team === "B"),
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
  id: uid(),
  type,
  old_name: generateFullName(old_player),
  ...(new_player && { new_name: generateFullName(new_player) }),
  date: new Date(),
});

/*
  Pesos, the way the group writes them: "$ 2.000", no cents. The price is what the pitch costs; the
  share is what each person on it puts in, rounded up so the organiser is not left short by a
  peso per head.
*/
const PESOS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export const formatMoney = (amount: number): string => PESOS.format(amount);

export function pricePerPlayer(price: number | null | undefined, playing: number): number | null {
  if (!price || price <= 0 || playing <= 0) return null;

  return Math.ceil(price / playing);
}

/*
  "24000", "24.000" and "$24.000" are all the same price; an empty box is no price, not zero.
  Takes unknown because react-hook-form hands the converter whatever the field holds, and before
  anything is typed that is the null it was born with — Number(null) is 0, which is how an empty
  box came to say "0" and look like something that had to be filled in.
*/
export function parsePrice(value: unknown): number | null {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits ? Number(digits) : null;
}
