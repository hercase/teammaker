import { FC, ReactNode } from "react";
import classNames from "classnames";
import { Kit, PresetColor, TeamSide } from "@/types";
import { BIB_HEX, DARK_HEX, KIT_PRESETS, LIGHT_HEX, PRESET_COLORS, setShirt, TEAM_SIDES } from "@/utils/kit";
import ShirtIcon from "@/components/Icons/ShirtIcon";
import BibIcon from "@/components/Icons/BibIcon";

interface KitSelectorProps {
  value: Kit;
  onChange: (kit: Kit) => void;
}

const MODES = [
  { mode: "shades", label: "Claras / oscuras" },
  { mode: "shirts", label: "Colores" },
  { mode: "bibs", label: "Pecheras" },
] as const;

const STARTING_KIT: Record<(typeof MODES)[number]["mode"], Kit> = {
  shirts: { mode: "shirts", teamA: "white", teamB: "blue" },
  shades: { mode: "shades", lightTeam: "A" },
  bibs: { mode: "bibs", bibTeam: "A" },
};

interface SideChoiceProps {
  label: string;
  name: string;
  selected: TeamSide;
  icon: (side: TeamSide) => ReactNode;
  onSelect: (side: TeamSide) => void;
}

/*
  Bibs and shades ask the same question — which of the two teams is the marked one — so they are
  the same control, and only the garment drawn on it changes.
*/
const SideChoice: FC<SideChoiceProps> = ({ label, name, selected, icon, onSelect }) => (
  <div role="radiogroup" aria-label={label} className="flex gap-2">
    {TEAM_SIDES.map((side) => (
      <label
        key={side}
        className={classNames(
          "flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-400",
          selected === side
            ? "border-text bg-surface-hover font-medium text-text ring-1 ring-text"
            : "border-border-strong text-text-muted opacity-80 hover:opacity-100"
        )}
      >
        <input
          type="radio"
          name={name}
          value={side}
          checked={selected === side}
          onChange={() => onSelect(side)}
          className="sr-only"
        />
        {icon(side)}
        Equipo {side}
      </label>
    ))}
  </div>
);

interface ShirtRowProps {
  side: TeamSide;
  selected: PresetColor;
  onSelect: (color: PresetColor) => void;
}

const ShirtRow: FC<ShirtRowProps> = ({ side, selected, onSelect }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-text-muted">Equipo {side}</span>
    {/* Native radios keep arrow-key navigation and screen reader grouping for free. */}
    <div role="radiogroup" aria-label={`Camiseta del equipo ${side}`} className="flex justify-between gap-1">
      {PRESET_COLORS.map((color) => (
        <label
          key={color}
          /*
            The chosen kit is at full strength and the rest are held back just enough to recede. The
            app draws nothing else with a glow, so a glow here read as a different product.
          */
          className={classNames(
            "grid size-11 cursor-pointer place-items-center rounded-lg transition-all focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-400",
            selected === color ? "bg-surface-hover ring-2 ring-text" : "opacity-80 hover:opacity-100"
          )}
        >
          <input
            type="radio"
            name={`kit-${side}`}
            value={color}
            checked={selected === color}
            onChange={() => onSelect(color)}
            className="sr-only"
          />
          <span className="sr-only">{KIT_PRESETS[color].label}</span>
          <ShirtIcon color={KIT_PRESETS[color].hex} size={28} />
        </label>
      ))}
    </div>
  </div>
);

const KitSelector: FC<KitSelectorProps> = ({ value, onChange }) => (
  <fieldset className="panel flex flex-col gap-4 p-4">
    <legend className="sr-only">Cómo se distinguen los equipos</legend>

    <div
      role="radiogroup"
      aria-label="Cómo se distinguen los equipos"
      className="grid grid-cols-3 rounded-lg border border-border-strong p-0.5"
    >
      {MODES.map(({ mode, label }) => (
        <label
          key={mode}
          className={classNames(
            "flex min-h-9 cursor-pointer items-center justify-center rounded-md px-1 text-center text-sm leading-tight transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-400",
            value.mode === mode ? "bg-primary-600 text-white" : "text-text-muted hover:text-text"
          )}
        >
          <input
            type="radio"
            name="kit-mode"
            value={mode}
            checked={value.mode === mode}
            onChange={() => onChange(STARTING_KIT[mode])}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </div>

    {value.mode === "shirts" && (
      <div className="flex flex-col gap-3">
        <ShirtRow side="A" selected={value.teamA} onSelect={(color) => onChange(setShirt(value, "A", color))} />
        <ShirtRow side="B" selected={value.teamB} onSelect={(color) => onChange(setShirt(value, "B", color))} />
      </div>
    )}

    {value.mode === "shades" && (
      <SideChoice
        label="Qué equipo va de claro"
        name="kit-light-team"
        selected={value.lightTeam}
        icon={(side) => <ShirtIcon color={value.lightTeam === side ? LIGHT_HEX : DARK_HEX} size={28} />}
        onSelect={(lightTeam) => onChange({ mode: "shades", lightTeam })}
      />
    )}

    {value.mode === "bibs" && (
      <SideChoice
        label="Qué equipo usa pechera"
        name="kit-bib-team"
        selected={value.bibTeam}
        icon={(side) => (side === value.bibTeam ? <BibIcon color={BIB_HEX} size={28} /> : <ShirtIcon size={28} />)}
        onSelect={(bibTeam) => onChange({ mode: "bibs", bibTeam })}
      />
    )}
  </fieldset>
);

export default KitSelector;
