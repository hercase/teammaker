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
/*
  These are no longer the vocabulary, they are the swatches offered first and the dictionary that
  names a colour. A shirt is any hex now; `nearestPreset` is what turns one back into a word, so
  a panel can still be titled "Roja" and a dialog can still ask about "los de rojo".
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

/*
  The panel a garment is drawn against, and the line to draw when it cannot be seen on it. Taken
  from the theme rather than guessed: --surface is what team-panel mixes the kit into, and
  --color-border-strong is the line the rest of the app already uses for an edge you must see.
*/
const PANEL_HEX = "#191526";
const EDGE_HEX = "#a09eaa";

/*
  A dark garment on a dark interface cannot be solved with a fill — measured against the panel, a
  charcoal reaches 1.57:1 and going darker only trades that for 1.06:1; the shape vanishes either
  way. So a colour that cannot hold its own shape is drawn as a contour instead.

  Computed rather than hardcoded onto the one preset that needed it. With any hex on offer there
  is no list to mark up, and the rule was never about black: it is about 3:1, which is what WCAG
  1.4.11 asks of the boundary of anything you have to make out.
*/
export const garmentEdge = (hex: string): string => (tinycolor.readability(hex, PANEL_HEX) < 3 ? EDGE_HEX : hex);

// Kept for the shades kit, whose dark side is the old black preset.
export const presetEdge = (color: PresetColor) => garmentEdge(KIT_PRESETS[color].hex);

export const PRESET_COLORS = Object.keys(KIT_PRESETS) as PresetColor[];

/*
  The six offered as swatches, and six is the number because six fit one row at 44px on the
  narrowest screen this layout is checked at. Celeste is the one left out: it is the colour an
  Argentine sideline has most of, but beside the blue it is the only pair in the set that has to be
  told apart rather than seen apart — and a row of examples is worth more when every square in it
  is obviously a different answer. It is still in KIT_PRESETS, so it still names a colour, and the
  picker below the swatches reaches it in one drag.
*/
export const SWATCH_COLORS: PresetColor[] = ["white", "black", "blue", "red", "green", "yellow"];

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

// What Colores opens on: the two shirts any sideline has, and the two the app drew before.
export const DEFAULT_SHIRTS: ShirtsKit = { mode: "shirts", teamA: KIT_PRESETS.white.hex, teamB: KIT_PRESETS.blue.hex };

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
/*
  The preset a colour *is*, not the one it is near. Naming is the one place the difference matters:
  the panel header is read off the shared picture, so calling a teal "Verde" because green is the
  closest of six is not a shorthand, it is wrong — and nobody can correct a title they did not
  choose. A colour that is not a preset has no name here, and the team is titled the way bibs mode
  already titles both of its panels.
*/
export const presetOf = (hex: string): PresetColor | undefined =>
  PRESET_COLORS.find((preset) => KIT_PRESETS[preset].hex === tinycolor(hex).toHexString());

export function nearestPreset(hex?: string): PresetColor {
  const target = tinycolor(hex);

  if (!target.isValid()) return "white";

  /*
    A preset names itself. Without this the black shirt came back as "Azul": #22242e is a very dark
    blue-grey whose saturation clears the greyscale cut-off, so it took the hue path and landed on
    the nearest chromatic preset. Nothing is nearer to a colour than that colour.
  */
  const exact = presetOf(target.toHexString());

  if (exact) return exact;

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
  Null means this team wears nothing worth drawing. With bibs only one side puts something on, so
  giving the other a white shirt would be inventing a kit nobody agreed to.
*/
export function kitColor(kit: Kit, side: TeamSide): string | null {
  if (kit.mode === "bibs") return kit.bibTeam === side ? BIB_HEX : null;
  if (kit.mode === "shades") return kit.lightTeam === side ? LIGHT_HEX : DARK_HEX;

  return side === "A" ? kit.teamA : kit.teamB;
}

/*
  The same kit drawn as a line rather than as a garment: the panel border, and the contour of an
  icon whose fill is too dark to hold a shape. A black panel border would not be a border.
*/
export function kitEdge(kit: Kit, side: TeamSide): string | null {
  if (kit.mode === "bibs") return kit.bibTeam === side ? BIB_HEX : null;
  if (kit.mode === "shades") return kit.lightTeam === side ? LIGHT_HEX : DARK_EDGE;

  return garmentEdge(side === "A" ? kit.teamA : kit.teamB);
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

  const preset = presetOf(side === "A" ? kit.teamA : kit.teamB);

  return preset ? KIT_PRESETS[preset].label : `Equipo ${side}`;
}

/*
  The team as people talk about it, for a sentence: "¿Quién se suma a los de oscuro?". The label is
  the team's name on a panel ("Oscuras") and reads wrong the moment it is spoken about; this is
  what the group actually says on the sideline. Bibs mode has no colour to say, so it is the team.
*/
export function teamPhrase(kit: Kit, side: TeamSide): string {
  if (kit.mode === "bibs") return `el equipo ${side}`;
  if (kit.mode === "shades") return kit.lightTeam === side ? "los de claro" : "los de oscuro";

  const preset = presetOf(side === "A" ? kit.teamA : kit.teamB);

  return preset ? `los de ${KIT_PRESETS[preset].wearing}` : `el equipo ${side}`;
}

/*
  Two teams in the same shirt is the one thing this screen must never say, and neither of the two
  ways a kit arrives from outside can promise it: migration maps each stored hex on its own, so two
  shades of blue both land on "blue", and persisted JSON can say anything at all. Rather than throw
  the whole kit away, the second team is moved to the first preset that is still free.
*/
/*
  Where the second team goes when both arrive in the same shirt. Two candidates rather than one,
  because a single fallback cannot move a team off itself: two navies both migrated to blue, the
  replacement was blue, and the two teams stayed in the same shirt — which is the one thing this
  screen must never say.
*/
const freeShirt = (taken: string): string =>
  [KIT_PRESETS.white.hex, KIT_PRESETS.blue.hex].find((hex) => hex !== taken) ?? KIT_PRESETS.blue.hex;

function shirts(teamA: string, teamB: string): ShirtsKit {
  return { mode: "shirts", teamA, teamB: teamA === teamB ? freeShirt(teamA) : teamB };
}

// A shirt is whatever tinycolor can read as a colour, normalised so two spellings of one hex match.
const shirtHex = (value: unknown): string | null => {
  const color = tinycolor(typeof value === "string" ? value : "");

  return color.isValid() ? color.toHexString() : null;
};

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
    const [teamA, teamB] = [shirtHex(candidate.teamA), shirtHex(candidate.teamB)];

    return teamA && teamB ? shirts(teamA, teamB) : DEFAULT_KIT;
  }

  return DEFAULT_KIT;
}

/*
  Two teams cannot wear the same shirt, so picking the colour the other team already has swaps
  them instead of being rejected. Disabling the taken colour would need a third colour as an
  intermediate step just to exchange two kits.
*/
export function setShirt(kit: ShirtsKit, side: TeamSide, color: string): ShirtsKit {
  const mine = side === "A" ? kit.teamA : kit.teamB;
  const taken = side === "A" ? kit.teamB : kit.teamA;
  const other = taken === color ? mine : taken;

  return side === "A" ? { mode: "shirts", teamA: color, teamB: other } : { mode: "shirts", teamA: other, teamB: color };
}

// Matches persisted before this change stored `colors: { teamA: hex, teamB: hex }`.
export function migrateColorsToKit(colors: unknown): Kit {
  if (!colors || typeof colors !== "object") return DEFAULT_KIT;

  const { teamA, teamB } = colors as { teamA?: string; teamB?: string };

  return shirts(KIT_PRESETS[nearestPreset(teamA)].hex, KIT_PRESETS[nearestPreset(teamB)].hex);
}
