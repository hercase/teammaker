import { addDays, format, isBefore, setHours, setMinutes, setSeconds, startOfMinute } from "date-fns";

/*
  What a WhatsApp list actually looks like when it is pasted here.

  The message is not a list of players. It is a title ("Partido de los miércoles"), a line with
  the day and the time, a line with the pitch, a heading ("Esta semana:") and then the players,
  numbered. Read line by line as names, one real message produced 16 players out of 12 — "Partido",
  "Miércoles", "Cancha" and "Esta" were on the teams — and the person pasting it had to delete four
  lines and then type the pitch and the time into the fields below, off the same lines they had
  just deleted.

  The rule that holds for every sample message: a player is a line that starts with a number. The
  lines that do not are read for the two things the form asks for anyway. A list without any
  numbering at all is still accepted the old way, every line a name, so nothing typed by hand
  stops working.
*/

export interface ParsedMessage {
  // The player lines, numbering still attached; generatePlayer strips it like any other symbol.
  players: string[];
  // The numbered lines after a heading that says "suplentes" (or reserva, or lista de espera).
  substitutes: string[];
  location?: string;
  // In the datetime-local field's own spelling, ready to be written into it.
  date?: string;
}

/*
  WhatsApp inserts U+2060 WORD JOINER between the number and the name when it formats a list —
  42 of them in one real message. It is invisible, it is not whitespace, and it is a letter as
  far as \p{L} is not concerned, so " 6.\u2060 \u2060Keis" has to be cleaned before anything reads
  it. The rest of the range is the other zero-width characters keyboards and copy-paste leave.
*/
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g;

// "1. Lucho", "12.  Max", " 6) Keis", "3- Mauro", "4 Lihue": a number, maybe a mark, then a name.
const NUMBERED_LINE = /^\d{1,2}\s*[.)\-:]?\s+\S/;

// "18.30hrs", "20hs", "18:30 h", "20 hs" — an hour, optional minutes, and how the group writes "hours".
const TIME = /\b(\d{1,2})(?:[:.](\d{2}))?\s*(?:hs|hrs|h)\b\.?/i;

const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
};

const WEEKDAY = /\b(domingo|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado)\b/i;

// A heading that turns the rest of the list into the waiting list.
const SUBSTITUTES_HEADING = /suplente|reserva|espera/i;

// The words the group uses to introduce the pitch, in the samples and in the ways they get abbreviated.
const LOCATION = /(?:cancha|lugar|direcci[oó]n|club|d[oó]nde)\s*:?\s*(.+)$/i;

const FIELD_FORMAT = "yyyy-MM-dd'T'HH:mm";

/*
  "Miércoles 18.30hrs" is the next Wednesday at 18:30, counted from now: the message is about the
  coming match, and if today is that day and the hour has passed it means next week. Only a line
  with both a day and a time can say that; "Partido de los miércoles" names the day and is not a
  date. Takes `now` so the tests can stand still.
*/
export function nextKickoff(weekday: number, hours: number, minutes: number, now: Date = new Date()): string {
  let date = startOfMinute(setSeconds(setMinutes(setHours(now, hours), minutes), 0));

  date = addDays(date, (weekday - now.getDay() + 7) % 7);

  if (!isBefore(now, date)) date = addDays(date, 7);

  return format(date, FIELD_FORMAT);
}

const readDate = (line: string, now: Date): string | undefined => {
  const day = line.match(WEEKDAY);
  const time = line.match(TIME);

  if (!day || !time) return undefined;

  const hours = Number(time[1]);
  const minutes = Number(time[2] ?? 0);

  if (hours > 23 || minutes > 59) return undefined;

  return nextKickoff(WEEKDAYS[day[1].toLowerCase()], hours, minutes, now);
};

const readLocation = (line: string): string | undefined => {
  const match = line.match(LOCATION);

  // Emoji and punctuation ride along on both sides of the words in a real message.
  const place = match?.[1]
    .replace(/[^\p{L}\p{N}\s.,ºª°/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return place || undefined;
};

export function parseMessage(text: string, now: Date = new Date()): ParsedMessage {
  const lines = text
    .replace(INVISIBLE, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const numbered = lines.filter((line) => NUMBERED_LINE.test(line));

  // Nothing numbered: a list typed by hand, every line a name, as it always was.
  if (numbered.length === 0) return { players: lines, substitutes: [] };

  const parsed: ParsedMessage = { players: [], substitutes: [] };
  let waiting = false;

  for (const line of lines) {
    if (NUMBERED_LINE.test(line)) {
      (waiting ? parsed.substitutes : parsed.players).push(line);
      continue;
    }

    if (SUBSTITUTES_HEADING.test(line)) waiting = true;

    parsed.date ??= readDate(line, now);
    parsed.location ??= readLocation(line);
  }

  return parsed;
}
