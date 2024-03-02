import { Player } from "@/types";
import { uniq } from "lodash";

export function generatePlayers(str: string) {
  const separetedByLine = str.split("\n");
  const lettersOnly = separetedByLine.map((p) => p.replace(/[0-9.]/g, "").trim());
  const uniquePlayers = uniq(lettersOnly).filter((p) => p !== "");

  const playersList: Player[] = uniquePlayers.map((p) => {
    const onlyLetters = p.replace(/[^a-zA-Zà-üÀ-Ü]/g, " ");
    const [name, details] = onlyLetters.split(" ");
    return { name, details };
  });

  return playersList;
}

export const trucanteString = (str: string, maxChar: number) => {
  if (str.length > maxChar) {
    return str.substring(0, maxChar) + "...";
  }
  return str;
};
