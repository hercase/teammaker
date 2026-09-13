import tinycolor from "tinycolor2";
import { Kit, PresetColor, ShirtsKit, TeamSide } from "@/types";

/*
  A map rather than an enum, and only the colours a pickup game actually has on the sidelines.
  The native colour wheel was too much ceremony for a choice between white and blue.
*/
/*
  Desaturated and pulled cooler so the kits belong to the same world as the rest of the interface.
  Primary red, green and yellow each held up on their own but together they read as a sticker sheet
  from another app: saturation went from 79/69/90% down to 62/45/53%, and the contrast against the
  panel held or improved everywhere. Blue was later brought down too: it had stayed at full
  saturation while its five siblings sat between 15 and 62%, so it read as borrowed from somewhere
  else. Black is the one that cannot win — a black shirt on a dark
  interface is a contradiction — so it is a charcoal that reads as a shape beside its own label.

  Then brought back up by 15 points, all five together. At 26px in the kit picker, seven in a row,
  the muted set read as grey versions of themselves — these are garments, not interface accents,
  and "roja" has to be recognisable as red at a glance. +30 was tried beside it and is the neon
  sheet again; +15 is the step where each colour is unmistakably itself and none of them shouts.
  Lightness is unchanged, so the contrast measurements above still hold.
*/
/*
  `edge` is what to draw when the garment has to be seen rather than shown: the contour of its icon,
  and the border of the panel that means "this team wears it". Only the dark shirt needs one.

  A dark garment on a dark interface cannot be solved with a fill. Measured against this panel, the
  old charcoal reached 1.57:1 and making it darker only traded that for 1.06:1 — the shape vanishes
  either way. So the fill is finally properly black, which is what it is called, and the contour
  carries the shape at 4.06:1. The contour is --color-border-strong, not a colour of its own.
*/
/*
  Celeste is the seventh, and the one an Argentine sideline actually has most of: the Selección,
  Racing, Belgrano, Temperley. Lighter and greener than the blue so the two read apart at 26px —
  hue 200 against 225, lightness 74% against 65% — and at the same restraint as its siblings.
*/
// `label` names the shirt ("Blanca"); `wearing` is how the group names the people in it ("los de blanco").
export const KIT_PRESETS: Record<PresetColor, { label: string; wearing: string; hex: string; edge?: string }> = {
  white: { label: "Blanca", wearing: "blanco", hex: "#e7e9f2" },
  black: { label: "Negra", wearing: "negro", hex: "#22242e", edge: "#827ca2" },
  celeste: { label: "Celeste", wearing: "celeste", hex: "#85caf2" },
  blue: { label: "Azul", wearing: "azul", hex: "#6085ee" },
  red: { label: "Roja", wearing: "rojo", hex: "#e8505e" },
  green: { label: "Verde", wearing: "verde", hex: "#32c88e" },
  yellow: { label: "Amarilla", wearing: "amarillo", hex: "#dab140" },
};

// What a preset looks like as a line. Falls back to the fill for every colour that reads on its own.
export const presetEdge = (color: PresetColor) => KIT_PRESETS[color].edge ?? KIT_PRESETS[color].hex;

export const PRESET_COLORS = Object.keys(KIT_PRESETS) as PresetColor[];

// High-vis orange, which is what a bib looks like on a pitch.
/*
  Stays loud on purpose, outside the muted family the shirts belong to. A bib is high-visibility in
  real life and it is the one kit that has to be unmistakable at a glance on a pitch.
*/
export const BIB_HEX = "#f97316";

// The two ends of the light/dark split, reusing the white and black shirts so nothing new is invented.
export const LIGHT_HEX = KIT_PRESETS.white.hex;
export const DARK_HEX = KIT_PRESETS.black.hex;
export const DARK_EDGE = presetEdge("black");

/*
  Light against dark is the default because it is what a pickup game falls back to: nobody has to
  own a matching shirt, only to be on the right side of the split.
*/
export const DEFAULT_KIT: Kit = { mode: "shades", lightTeam: "A" };

export const TEAM_SIDES: TeamSide[] = ["A", "B"];

/*
  Null means this team wears nothing worth drawing. With bibs only one side puts something on, so
  giving the other a white shirt would be inventing a kit nobody agreed to.
*/
export function kitColor(kit: Kit, side: TeamSide): string | null {
  if (kit.mode === "bibs") return kit.bibTeam === side ? BIB_HEX : null;
  if (kit.mode === "shades") return kit.lightTeam === side ? LIGHT_HEX : DARK_HEX;

  return KIT_PRESETS[side === "A" ? kit.teamA : kit.teamB].hex;
}

/*
  The same kit drawn as a line rather than as a garment: the panel border, and the contour of an
  icon whose fill is too dark to hold a shape. A black panel border would not be a border.
*/
export function kitEdge(kit: Kit, side: TeamSide): string | null {
  if (kit.mode === "bibs") return kit.bibTeam === side ? BIB_HEX : null;
  if (kit.mode === "shades") return kit.lightTeam === side ? LIGHT_HEX : DARK_EDGE;

  return presetEdge(side === "A" ? kit.teamA : kit.teamB);
}

/*
  In shirts mode the panel is titled by its colour, because the colour is what tells the teams
  apart and a colour on its own is not something everyone can read. In bibs mode neither panel
  carries a garment: only one side wears anything, so putting it in one header left the other with
  a hole where a title should be. There the panels are titled A and B and a single line underneath
  says which of them wears the bibs.
*/
export function kitLabel(kit: Kit, side: TeamSide): string {
  if (kit.mode === "bibs") return `Equipo ${side}`;
  if (kit.mode === "shades") return kit.lightTeam === side ? "Claras" : "Oscuras";

  return KIT_PRESETS[side === "A" ? kit.teamA : kit.teamB].label;
}

/*
  The team as people talk about it, for a sentence: "¿Quién se suma a los de oscuro?". The label is
  the team's name on a panel ("Oscuras") and reads wrong the moment it is spoken about; this is
  what the group actually says on the sideline. Bibs mode has no colour to say, so it is the team.
*/
export function teamPhrase(kit: Kit, side: TeamSide): string {
  if (kit.mode === "bibs") return `el equipo ${side}`;
  if (kit.mode === "shades") return kit.lightTeam === side ? "los de claro" : "los de oscuro";

  return `los de ${KIT_PRESETS[side === "A" ? kit.teamA : kit.teamB].wearing}`;
}

const CHROMATIC_PRESETS: PresetColor[] = ["celeste", "blue", "red", "green", "yellow"];

// Shortest way around the colour wheel.
function hueDistance(a: number, b: number): number {
  const gap = Math.abs(a - b) % 360;

  return gap > 180 ? 360 - gap : gap;
}

/*
  Matches a stored hex to the closest preset, for matches saved before the kit existed.

  Compared by hue rather than by RGB distance: the old default #151d65 is a very dark navy, and
  in plain RGB it lands nearer to black than to blue, which is not what anyone picking it meant.
  Nearly greyscale colours are decided by lightness instead, since they have no meaningful hue.
*/
export function nearestPreset(hex?: string): PresetColor {
  const target = tinycolor(hex);

  if (!target.isValid()) return "white";

  const { h, s, l } = target.toHsl();

  if (s < 0.15) return l < 0.5 ? "black" : "white";

  return CHROMATIC_PRESETS.reduce((closest, preset) =>
    hueDistance(tinycolor(KIT_PRESETS[preset].hex).toHsl().h, h) <
    hueDistance(tinycolor(KIT_PRESETS[closest].hex).toHsl().h, h)
      ? preset
      : closest
  );
}

/*
  Two teams in the same shirt is the one thing this screen must never say, and neither of the two
  ways a kit arrives from outside can promise it: migration maps each stored hex on its own, so two
  shades of blue both land on "blue", and persisted JSON can say anything at all. Rather than throw
  the whole kit away, the second team is moved to the first preset that is still free.
*/
function shirts(teamA: PresetColor, teamB: PresetColor): ShirtsKit {
  const free = teamA === teamB ? PRESET_COLORS.find((preset) => preset !== teamA) : teamB;

  return { mode: "shirts", teamA, teamB: free ?? teamB };
}

/*
  The persisted JSON is not trusted: anything that does not match the union falls back to the
  default instead of letting a half-shaped object reach the render.
*/
export function parseKit(value: unknown): Kit {
  if (!value || typeof value !== "object") return DEFAULT_KIT;

  const candidate = value as Partial<Kit> & {
    teamA?: unknown;
    teamB?: unknown;
    bibTeam?: unknown;
    lightTeam?: unknown;
  };

  if (candidate.mode === "bibs") {
    return TEAM_SIDES.includes(candidate.bibTeam as TeamSide)
      ? { mode: "bibs", bibTeam: candidate.bibTeam as TeamSide }
      : DEFAULT_KIT;
  }

  if (candidate.mode === "shades") {
    return TEAM_SIDES.includes(candidate.lightTeam as TeamSide)
      ? { mode: "shades", lightTeam: candidate.lightTeam as TeamSide }
      : DEFAULT_KIT;
  }

  if (candidate.mode === "shirts") {
    const isPreset = (side: unknown) => PRESET_COLORS.includes(side as PresetColor);

    return isPreset(candidate.teamA) && isPreset(candidate.teamB)
      ? shirts(candidate.teamA as PresetColor, candidate.teamB as PresetColor)
      : DEFAULT_KIT;
  }

  return DEFAULT_KIT;
}

/*
  Two teams cannot wear the same shirt, so picking the colour the other team already has swaps
  them instead of being rejected. Disabling the taken colour would need a third colour as an
  intermediate step just to exchange two kits.
*/
export function setShirt(kit: ShirtsKit, side: TeamSide, color: PresetColor): ShirtsKit {
  const mine = side === "A" ? kit.teamA : kit.teamB;
  const taken = side === "A" ? kit.teamB : kit.teamA;
  const other = taken === color ? mine : taken;

  return side === "A" ? { mode: "shirts", teamA: color, teamB: other } : { mode: "shirts", teamA: other, teamB: color };
}

// Matches persisted before this change stored `colors: { teamA: hex, teamB: hex }`.
export function migrateColorsToKit(colors: unknown): Kit {
  if (!colors || typeof colors !== "object") return DEFAULT_KIT;

  const { teamA, teamB } = colors as { teamA?: string; teamB?: string };

  return shirts(nearestPreset(teamA), nearestPreset(teamB));
}
