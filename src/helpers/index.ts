import { Players } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { uniq } from "lodash";

// Strings

export function filterPlayers(str: string) {
  const regex = /[a-zÀ-ÿ\s]+/gi;

  const players: Players = [];
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    m.forEach((match) => {
      const cleanedPlayerName = match.toLowerCase().trim();
      players.push(cleanedPlayerName);
    });
  }

  const cleanPlayersList = players
    .toString()
    .replace(/\n/g, ",")
    .split(",")
    .filter((item) => item);

  const duplicatesRemoved = uniq(cleanPlayersList);

  return [...duplicatesRemoved];
}

export const trucanteString = (str: string, maxChar: number) => {
  if (str.length > maxChar) {
    return str.substring(0, maxChar) + "...";
  }
  return str;
};
