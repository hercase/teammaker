import { format } from "date-fns";
import { es } from "date-fns/locale";
import { nextKickoff } from "@/utils/message";
import { formatMoney } from "@/utils";

/*
  One place decides how a kickoff is written. The heading and the caption that leaves with the
  shared picture were formatting the same match two different ways on the same screen, so the
  picture and the words beside it disagreed about when the game was.
*/
export const formatKickoff = (date: string | Date | null): string =>
  date ? `${format(date, "EEEE dd/MM", { locale: es })} · ${format(date, "p", { locale: es })} hs` : "";

/*
  A name the group can find again in their camera roll: the pitch and the day, stripped of accents
  and spaces. Without it every week's teams arrive as "equipos (3).png".
*/
export const matchFileName = (location: string, date: string | Date | null): string =>
  [location, date && format(date, "ddMMM", { locale: es })]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "equipos";

/*
  "luro y mexico" arrives as whoever typed it; the card uppercases with CSS so the store never
  learns. The caption is plain text in the chat, so it has to title-case itself. Small words stay
  lower mid-phrase the way Spanish writes a pitch: "Quintana y Salta", not "Quintana Y Salta".
*/
const SMALL_WORDS = new Set(["y", "e", "de", "del", "la", "las", "los", "a", "al"]);

export function titleCasePlace(place: string): string {
  return place
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("es-AR");

      if (index > 0 && SMALL_WORDS.has(lower)) return lower;

      return lower.charAt(0).toLocaleUpperCase("es-AR") + lower.slice(1);
    })
    .join(" ");
}

const capitalise = (value: string): string =>
  value ? value.charAt(0).toLocaleUpperCase("es-AR") + value.slice(1) : value;

/*
  The words that travel with the picture. Written as a heading the group can scan, not as a
  sentence ("Equipos para el martes… en luro y mexico"): place and weekday capitalised, price per
  head when there is one, cupo left out because the chips on the picture already say it.

  Android WhatsApp shows this under the image; iOS usually drops the text that comes with a file.
*/
export const shareCaption = (
  location: string,
  date: string | Date | null,
  pricePerHead: number | null = null
): string => {
  const where = location.trim() ? titleCasePlace(location) : "";
  const when = date
    ? `${capitalise(format(date, "EEEE dd/MM", { locale: es }))} ${format(date, "p", { locale: es })}hs`
    : "";
  const cost = pricePerHead ? `${formatMoney(pricePerHead)} c/u` : "";

  return [where, when, cost].filter(Boolean).join(" · ") || "Equipos";
};

/*
  The date the form opens with. The group plays the same day at the same hour every week, so the
  last match already says when the next one is: the coming occurrence of that weekday, at that
  time, counted from now. Nothing to propose before a first match has been created.
*/
export const proposeKickoff = (previous: string | Date | null, now: Date = new Date()): string | undefined => {
  if (!previous) return undefined;

  const last = new Date(previous);

  if (Number.isNaN(last.getTime())) return undefined;

  return nextKickoff(last.getDay(), last.getHours(), last.getMinutes(), now);
};
