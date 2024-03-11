import { Player } from "@/types";
import { uniq, uniqueId } from "lodash";

// n
export function generatePlayer(user_str: string) {
  // regex to filter only letters and spaces, remove special characters and numbers, and end initial and final spaces
  const onlyLetters = user_str.replace(/[^a-zA-Z\s]/g, "").trim();

  const [name, ...details] = onlyLetters.split(" ");

  return {
    id: uniqueId("player_"),
    name,
    details: details.join(" "),
  };
}

export function generatePlayers(str: string) {
  const separetedByLine = str.split("\n");
  const lettersOnly = separetedByLine.map((p) => p.replace(/[0-9.]/g, "").trim());
  const uniquePlayers = uniq(lettersOnly).filter((p) => p !== "");

  const playersList: Player[] = uniquePlayers.map((p) => generatePlayer(p));

  return playersList;
}

export const trucanteString = (str: string, maxChar: number) => {
  if (str.length > maxChar) {
    return str.substring(0, maxChar) + "...";
  }
  return str;
};
