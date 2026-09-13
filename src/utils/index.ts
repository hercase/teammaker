import { MatchEvent, Player } from "@/types";
import tinycolor from "tinycolor2";

// \p{L} with the u flag covers accents and ñ, which the previous [a-zA-Z] range stripped
const NON_NAME_CHARS = /[^\p{L}\s]/gu;

export function generatePlayer(user_str: string): Player {
  const onlyLetters = user_str.replace(NON_NAME_CHARS, "").replace(/\s+/g, " ").trim();
  const [name, ...details] = onlyLetters.split(" ");

  return {
    id: crypto.randomUUID(),
    name,
    details: details.join(" "),
  };
}

export function generatePlayers(str: string): Player[] {
  return str
    .split("\n")
    .map((line) => generatePlayer(line))
    .filter((player) => player.name !== "");
}

// teamB starts where teamA ends. Using slice(-half) overlaps by one on odd-sized lists.
export function splitTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  const half = Math.ceil(players.length / 2);

  return {
    teamA: players.slice(0, half),
    teamB: players.slice(half),
  };
}

export const generateFullName = (player: Player) => `${player.name} ${player.details ? `(${player.details})` : ""}`;

export const trucanteString = (str: string, maxChar: number) => {
  if (str.length > maxChar) {
    return str.substring(0, maxChar) + "...";
  }
  return str;
};

export const validateName = (value: string) => {
  if (!value?.trim()) return "Debes ingresar un nombre";
  if (!/^[\p{L}\s()]+$/u.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
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

export const getContrastColor = (hexcolor: string, isDarkMode: boolean) => {
  const mainColor = isDarkMode ? tinycolor(hexcolor).lighten(10) : tinycolor(hexcolor).darken(15);
  const contrastColor = mainColor.isDark() ? mainColor.brighten(40) : mainColor.darken(50);
  const finalColor = contrastColor.desaturate(20).toHexString();

  return finalColor;
};
