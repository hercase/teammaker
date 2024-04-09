import { MatchEvent, Player } from "@/types";
import { uniq, uniqueId } from "lodash";
import tinycolor from "tinycolor2";

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

export const generateFullName = (player: Player) => `${player.name} ${player.details ? `(${player.details})` : ""}`;

export const validateName = (value: string) => {
  if (!value) return "Debes ingresar un nombre";
  if (!/^[a-zA-Z\s\(\)]+$/.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
};

interface GenerateMatchEvent {
  type: MatchEvent["type"];
  old_player: Player;
  new_player?: Player;
}

export const generateMatchEvent = ({ type, old_player, new_player }: GenerateMatchEvent) => ({
  type,
  old_name: generateFullName(old_player),
  ...(new_player && { new_name: generateFullName(new_player) }),
  date: new Date(),
});

export const getContrastColor = (hexcolor: string) => {
  const mainColor = tinycolor(hexcolor);
  const contrastColor = mainColor.isDark() ? mainColor.brighten(40) : mainColor.darken(50);
  const finalColor = contrastColor.desaturate(20).toHexString();

  return finalColor;
};
