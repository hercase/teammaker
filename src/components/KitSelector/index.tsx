import { FC, ReactNode } from "react";
import classNames from "classnames";
import { Label, Radio, RadioGroup, Separator } from "@heroui/react";
import { Kit, KitMode, PresetColor, TeamSide } from "@/types";
import { BIB_HEX, DARK_EDGE, DARK_HEX, KIT_PRESETS, LIGHT_HEX, PRESET_COLORS, setShirt, TEAM_SIDES } from "@/utils/kit";
import ShirtIcon from "@/components/Icons/ShirtIcon";
import BibIcon from "@/components/Icons/BibIcon";

interface KitSelectorProps {
  value: Kit;
  onChange: (kit: Kit) => void;
}

/*
  None of these radios has a Radio.Control, and the control is the only part HeroUI draws a focus
  ring on — so with the keyboard, focus moved through the cards and nothing on the screen said
  where it was. The ring goes on Radio.Content, which is what React Aria marks focus-visible; inset,
  because the cards clip their corners and an outline offset outwards would be cut off.
*/
const FOCUS_RING =
  "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-primary-400";

// Two shirts, because every mode but bibs is a statement about a pair and not about one team.
function Pair({ left, right, rightOutline }: { left: string; right: string; rightOutline?: string }) {
  return (
    <span className="flex shrink-0 items-center -space-x-2">
      <ShirtIcon color={left} size={26} />
      <ShirtIcon color={right} outline={rightOutline} size={26} />
    </span>
  );
}

/*
  Three cards rather than three segments of a bar, and each one holds its own settings.

  This is the control nobody in the group ever found. A bar of labels was part of why: nothing in
  it said what picking one would do, and "Claras / oscuras" was three times the length of the other
  two, so the segments never balanced either.

  The label names the mode and the line under it explains the mode; neither repeats the other. "Con
  pecheras / Un equipo se pone la pechera" said "pechera" twice and explained nothing.

  The settings used to sit underneath all three, which read as a second, unrelated question — you
  picked a mode up there and then configured something down here. Opening them inside the card that
  was chosen says what they belong to without a word of explanation.

  Literally without a word: the settings carried a heading too ("¿Quién lleva la pechera?") above a
  row that already drew the bib on one of the two teams. If the card needs a caption to explain its
  own controls, the card is the thing to fix. The question survives only as the group's accessible
  name, where there is no drawing to read.
*/
const MODES: { mode: KitMode; label: string; hint: string; question: string; icon: ReactNode }[] = [
  {
    mode: "shades",
    label: "Claras y oscuras",
    hint: "Cada uno lleva lo que tiene",
    question: "¿Quién va de claro?",
    icon: <Pair left={LIGHT_HEX} right={DARK_HEX} rightOutline={DARK_EDGE} />,
  },
  {
    mode: "shirts",
    label: "Colores",
    hint: "Elegís las dos camisetas",
    question: "¿Qué camiseta lleva cada uno?",
    icon: <Pair left={KIT_PRESETS.blue.hex} right={KIT_PRESETS.red.hex} />,
  },
  {
    mode: "bibs",
    label: "Pecheras",
    hint: "Un equipo se las pone",
    question: "¿Quién lleva la pechera?",
    icon: <BibIcon size={26} />,
  },
];

const STARTING_KIT: Record<KitMode, Kit> = {
  shirts: { mode: "shirts", teamA: "white", teamB: "blue" },
  shades: { mode: "shades", lightTeam: "A" },
  bibs: { mode: "bibs", bibTeam: "A" },
};

interface SideChoiceProps {
  label: string;
  selected: TeamSide;
  icon: (side: TeamSide) => ReactNode;
  onSelect: (side: TeamSide) => void;
}

/*
  Bibs and shades ask the same question — which of the two teams is the marked one — so they are
  the same control, and only the garment drawn on it changes.
*/
const SideChoice: FC<SideChoiceProps> = ({ label, selected, icon, onSelect }) => (
  <RadioGroup
    aria-label={label}
    className="flex flex-row gap-2 **:data-[slot=radio]:mt-0"
    value={selected}
    onChange={(side) => onSelect(side as TeamSide)}
  >
    {TEAM_SIDES.map((side) => (
      /*
        No Radio.Control, so no dot: the garment drawn on the card is the answer, and a dot beside
        it would be the same question asked twice. The group still gets arrow-key navigation and
        the right announcement, which is what it is here for.
      */
      <Radio
        key={side}
        value={side}
        /*
          The unset option's edge is --color-border-strong at 60%, the same recipe as the outline
          button: --border measured 1.07:1 against the fill it sat on, which is a button nobody can
          see. The chosen one drops its border and lifts its fill instead, the way HeroUI marks a
          selected segment.
        */
        className={classNames(
          "min-h-11 flex-1 rounded-lg border text-sm transition-colors",
          selected === side
            ? "border-transparent bg-segment font-medium text-segment-foreground"
            : "border-border-strong/60 text-text-muted hover:bg-surface-hover"
        )}
      >
        <Radio.Content
          className={classNames("flex h-full w-full items-center justify-center gap-2 rounded-lg", FOCUS_RING)}
        >
          {icon(side)}
          Equipo {side}
        </Radio.Content>
      </Radio>
    ))}
  </RadioGroup>
);

interface ShirtRowProps {
  side: TeamSide;
  selected: PresetColor;
  onSelect: (color: PresetColor) => void;
}

/*
  The team's name sits above its shirts, not beside them. Six 44px targets with 8px between them
  are 304px wide, and a phone at 390px leaves the card 324px inside — so a label to the left had the
  shirts squeezed to 40px with 4px gaps, and at 320px the row overflowed the page by 62px.

  Seven columns sharing the card's width, one per preset. Six capped at 44px left a quarter of the
  row empty on a desktop; six uncapped spread them 65px apart. Seven fill a 24rem card at 48px each
  and a 390px phone at 39px — narrower than the 44px this app asks of a target, and the height is
  what holds at 44. At 320 they are 29px wide, which is the price of a row of seven on the smallest
  screen the layout is checked at.
*/
const ShirtRow: FC<ShirtRowProps> = ({ side, selected, onSelect }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-text-muted">Equipo {side}</span>

    <RadioGroup
      aria-label={`Camiseta del equipo ${side}`}
      className="grid grid-cols-7 gap-2 **:data-[slot=radio]:mt-0"
      value={selected}
      onChange={(color) => onSelect(color as PresetColor)}
    >
      {PRESET_COLORS.map((color) => (
        /*
          The chosen kit is at full strength and the rest are held back just enough to recede. The
          app draws nothing else with a glow, so a glow here read as a different product.
        */
        <Radio
          key={color}
          value={color}
          aria-label={KIT_PRESETS[color].label}
          className={classNames(
            "min-h-11 rounded-lg transition-all",
            selected === color ? "bg-segment" : "opacity-80 hover:bg-surface-hover hover:opacity-100"
          )}
        >
          <Radio.Content className={classNames("grid h-full w-full place-items-center rounded-lg", FOCUS_RING)}>
            <ShirtIcon color={KIT_PRESETS[color].hex} outline={KIT_PRESETS[color].edge} size={26} />
          </Radio.Content>
        </Radio>
      ))}
    </RadioGroup>
  </div>
);

const KitSelector: FC<KitSelectorProps> = ({ value, onChange }) => (
  /*
    **:data-[slot=radio]:mt-0 — HeroUI gives every radio of a vertical group mt-4, on top of any
    gap, so the cards sat 24px apart when the class said 8, and the side buttons inside a card
    floated 16px below its padding. Its own card demo removes it the same way.
  */
  <RadioGroup
    className="flex flex-col gap-2 **:data-[slot=radio]:mt-0"
    value={value.mode}
    onChange={(mode) => onChange(STARTING_KIT[mode as KitMode])}
  >
    <Label className="mb-2">Cómo se distinguen los equipos</Label>

    {MODES.map(({ mode, label, hint, question, icon }) => {
      const chosen = value.mode === mode;

      return (
        /*
          The settings are a sibling of Radio.Content, which is what makes this work: Content is
          the clickable part, so anything outside it can be operated without picking the mode
          again. That used to be a div with a hand-rolled radio and a comment explaining that the
          settings must not go inside the <label>; the library's anatomy says the same thing
          structurally, so it cannot be got wrong by accident.
        */
        <Radio
          key={mode}
          value={mode}
          className={classNames(
            "flex-col items-stretch overflow-hidden rounded-card border border-border transition-colors",
            chosen ? "bg-surface" : "bg-surface/40 hover:bg-surface"
          )}
        >
          {/*
            The chosen option is lit with --segment, the token HeroUI paints a selected tab with,
            and only the option: its settings stay on --surface below it. That step in fill is what
            separates the two, measured at 1.9:1 — the whole card used to be one fill with a
            --border hairline between the halves, and that line measured 1.07:1, so on the screen
            the option and its settings were one undivided block. Selection itself went from 1.24:1
            against the other cards to 2.08:1.

            The hint keeps its size and drops its dimming on the lit card: --muted on --segment is
            3.56:1, under the 4.5:1 that 12px text needs.
          */}
          <Radio.Content
            className={classNames(
              "flex min-h-12 w-full items-center gap-3 px-3 py-2 transition-colors",
              FOCUS_RING,
              chosen && "bg-segment text-segment-foreground"
            )}
          >
            {icon}
            <span className="min-w-0">
              <span className={classNames("block text-sm", chosen ? "font-medium" : "text-text-muted")}>{label}</span>
              <span className={classNames("block text-xs", !chosen && "text-text-subtle")}>{hint}</span>
            </span>
          </Radio.Content>

          {chosen && (
            <>
              {/* --separator is 1.1:1 on this ground and --border 1.2:1; the line has to clear 3:1
                  against the settings it caps, or it is the invisible hairline it replaces. */}
              <Separator className="bg-border-strong/60" />
              <div className="kit-settings flex flex-col gap-2 px-3 py-2.5">
                {value.mode === "shades" && (
                  <SideChoice
                    label={question}
                    selected={value.lightTeam}
                    icon={(side) => {
                      const light = value.lightTeam === side;

                      return (
                        <ShirtIcon
                          color={light ? LIGHT_HEX : DARK_HEX}
                          outline={light ? undefined : DARK_EDGE}
                          size={28}
                        />
                      );
                    }}
                    onSelect={(lightTeam) => onChange({ mode: "shades", lightTeam })}
                  />
                )}

                {value.mode === "shirts" && (
                  <>
                    <ShirtRow
                      side="A"
                      selected={value.teamA}
                      onSelect={(color) => onChange(setShirt(value, "A", color))}
                    />
                    <ShirtRow
                      side="B"
                      selected={value.teamB}
                      onSelect={(color) => onChange(setShirt(value, "B", color))}
                    />
                  </>
                )}

                {value.mode === "bibs" && (
                  <SideChoice
                    label={question}
                    selected={value.bibTeam}
                    /* Nothing for the other side: it is not wearing a white shirt, it is wearing
                     whatever it turned up in. Drawing one invents a kit nobody agreed to. */
                    icon={(side) => (side === value.bibTeam ? <BibIcon color={BIB_HEX} size={28} /> : null)}
                    onSelect={(bibTeam) => onChange({ mode: "bibs", bibTeam })}
                  />
                )}
              </div>
            </>
          )}
        </Radio>
      );
    })}
  </RadioGroup>
);

export default KitSelector;
