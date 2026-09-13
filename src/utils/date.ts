import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  The words that travel with the picture. "Quintana y Salta · miércoles 16/09 · 18:30 hs" was the
  heading's format reused as a caption, and read as a database row; the caption is a message to
  the group, so it is written as one. Whatever is missing is simply left out of the sentence, and
  the weekday is lower-case because Spanish writes it that way mid-sentence.

  Android WhatsApp shows this under the image; iOS usually drops the text that comes with a file.
*/
export const shareCaption = (location: string, date: string | Date | null): string => {
  const when = date
    ? `para el ${format(date, "EEEE dd/MM", { locale: es })} a las ${format(date, "p", { locale: es })} hs`
    : "";
  const where = location ? `en ${location}` : "";

  return ["Equipos", when, where].filter(Boolean).join(" ");
};
