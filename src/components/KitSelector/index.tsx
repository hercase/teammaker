import { FC, ReactNode } from "react";
import classNames from "classnames";
import {
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatchPicker,
  Label,
  parseColor,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { Kit, KitMode, ShirtsKit, TeamSide } from "@/types";
import {
  BIB_HEX,
  DARK_EDGE,
  DARK_HEX,
  DEFAULT_SHIRTS,
  garmentEdge,
  KIT_PRESETS,
  LIGHT_HEX,
  SWATCH_COLORS,
  setShirt,
  TEAM_SIDES,
} from "@/utils/kit";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
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
const MODES: { mode: KitMode; label: string; icon: ReactNode }[] = [
  {
    mode: "shades",
    label: "Claras y oscuras",
    icon: <Pair left={LIGHT_HEX} right={DARK_HEX} rightOutline={DARK_EDGE} />,
  },
  {
    mode: "shirts",
    label: "Colores",
    icon: <Pair left={KIT_PRESETS.blue.hex} right={KIT_PRESETS.red.hex} />,
  },
  {
    mode: "bibs",
    label: "Pecheras",
    icon: <BibIcon size={26} />,
  },
];

const STARTING_KIT: Record<KitMode, Kit> = {
  shirts: DEFAULT_SHIRTS,
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
          // No transition: these two stopped moving when the settings row stopped changing size.
          "min-h-11 flex-1 rounded-lg border text-sm",
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

/*
  The same shape as SideChoice, and that is the point of it. Colores used to be two labelled rows
  of seven shirts, which made the card 100px taller than the other two modes — so choosing a mode
  moved everything under it, on a form where what is under it is the rest of the form.

  Two buttons instead, one per team, each opening the colour in a popover. The seven presets are
  still the first thing in it, as swatches, so the common answer is still one tap; below them the
  group can reach the shirt it actually owns, which a list of seven could only ever approximate.

  It also retires a trade this file used to carry in a comment: seven targets sharing a card came
  out 39px wide on a 390px phone and 29px at 320, under the 44px this app asks of anything you
  press. In a popover they have room, and the two triggers are full-height buttons.
*/
const SHIRT_TRIGGER =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border-strong/60 text-sm text-text-muted hover:bg-surface-hover";

interface ShirtChoiceProps {
  kit: ShirtsKit;
  onChange: (kit: ShirtsKit) => void;
}

const ShirtChoice: FC<ShirtChoiceProps> = ({ kit, onChange }) => (
  <div className="flex flex-row gap-2">
    {TEAM_SIDES.map((side) => {
      const hex = side === "A" ? kit.teamA : kit.teamB;
      /* The contour only appears when the fill cannot hold the shape on this panel; see garmentEdge. */
      const edge = garmentEdge(hex);

      return (
        <ColorPicker
          key={side}
          className="flex-1"
          value={parseColor(hex)}
          onChange={(color) => onChange(setShirt(kit, side, color.toString("hex")))}
        >
          <ColorPicker.Trigger
            className={classNames(SHIRT_TRIGGER, FOCUS_RING)}
            aria-label={`Camiseta del equipo ${side}`}
          >
            <ShirtIcon color={hex} outline={edge !== hex ? edge : undefined} size={28} />
            Equipo {side}
            {/*
              The one thing that tells these two apart from the identical pair in the other two
              modes. There, the buttons are a choice and picking one answers the question; here each
              opens a colour of its own. Same shape, different behaviour, and nothing on the screen
              said so — a caret is the smallest honest way to say "this opens".
            */}
            <ChevronDownIcon className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
          </ColorPicker.Trigger>
          {/* Six swatches in one row at HeroUI's own size, and never wider than the screen. The
              hex field that came with the demo is gone: this is a group chat picking a shirt, and
              a colour anyone here wants is already under the thumb. */}
          <ColorPicker.Popover className="flex w-[min(100vw-1.5rem,17rem)] flex-col gap-3 p-3">
            {/* The sideline's usual answers, first and one tap away. */}
            <ColorSwatchPicker className="flex justify-between gap-2">
              {SWATCH_COLORS.map((preset) => (
                <ColorSwatchPicker.Item
                  key={preset}
                  color={KIT_PRESETS[preset].hex}
                  aria-label={KIT_PRESETS[preset].label}
                >
                  <ColorSwatchPicker.Swatch />
                </ColorSwatchPicker.Item>
              ))}
            </ColorSwatchPicker>

            <ColorArea.Root className="h-40 w-full rounded-lg">
              <ColorArea.Thumb />
            </ColorArea.Root>

            <ColorSlider.Root channel="hue" colorSpace="hsb">
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider.Root>
          </ColorPicker.Popover>
        </ColorPicker>
      );
    })}
  </div>
);

/*
  One row, under all three cards, that answers whichever is chosen.

  This lived inside the selected card until the three modes became the same control. They were not:
  Colores was two labelled rows of seven shirts while the others were two buttons, so a shared row
  would have been three different things wearing one frame, and it read — the note this replaces
  said so — as a second unrelated question. Now every mode asks exactly "which of the two teams",
  and only the garment on the buttons changes, so a single row is the answer to the card above it
  rather than a question of its own. It also means the block cannot change height at all.
*/
/*
  A label, not a question. It was "¿Quién va de claro?", and it was the only interrogative on a form
  whose every other field is a noun — Tu nombre, Lugar, Fecha, Cupo, Precio de la cancha — so it
  read as a different voice rather than as the same form asking one more thing.

  It names what is being assigned rather than the mode, or it would just say the card above it
  again: the Pecheras card followed by a "Pecheras" label is one word doing nothing twice.
*/
const SETTING_LABELS: Record<KitMode, string> = {
  shades: "Van de claro",
  shirts: "Camisetas",
  bibs: "Llevan la pechera",
};

const KitSettings: FC<{ kit: Kit; onChange: (kit: Kit) => void }> = ({ kit, onChange }) => (
  <div className="kit-settings flex flex-col gap-2 rounded-card border border-border bg-surface px-3 py-2.5">
    {/*
      On the screen, not only in the accessibility tree. It used to sit inside the chosen card;
      moving the row out from under the cards left two buttons reading "Equipo A" and "Equipo B"
      with nothing saying what answering them does — which is the whole of why nobody could tell
      they were allowed to swap the sides, or that Colores opens a colour.
    */}
    <span className="text-sm text-text-muted">{SETTING_LABELS[kit.mode]}</span>
    {kit.mode === "shades" && (
      <SideChoice
        label={SETTING_LABELS[kit.mode]}
        selected={kit.lightTeam}
        icon={(side) => {
          const light = kit.lightTeam === side;

          return <ShirtIcon color={light ? LIGHT_HEX : DARK_HEX} outline={light ? undefined : DARK_EDGE} size={28} />;
        }}
        onSelect={(lightTeam) => onChange({ mode: "shades", lightTeam })}
      />
    )}

    {kit.mode === "shirts" && <ShirtChoice kit={kit} onChange={onChange} />}

    {kit.mode === "bibs" && (
      <SideChoice
        label={SETTING_LABELS[kit.mode]}
        selected={kit.bibTeam}
        /* Nothing for the other side: it is not wearing a white shirt, it is wearing
           whatever it turned up in. Drawing one invents a kit nobody agreed to. */
        icon={(side) => (side === kit.bibTeam ? <BibIcon color={BIB_HEX} size={28} /> : null)}
        onSelect={(bibTeam) => onChange({ mode: "bibs", bibTeam })}
      />
    )}
  </div>
);

const KitSelector: FC<KitSelectorProps> = ({ value, onChange }) => (
  <div className="flex flex-col gap-2">
    {/*
    **:data-[slot=radio]:mt-0 — HeroUI gives every radio of a vertical group mt-4, on top of any
      gap, so the cards sat 24px apart when the class said 8, and the side buttons inside a card
      floated 16px below its padding. Its own card demo removes it the same way.
    */}
    <RadioGroup
      className="flex flex-col gap-2 **:data-[slot=radio]:mt-0"
      value={value.mode}
      onChange={(mode) => onChange(STARTING_KIT[mode as KitMode])}
    >
      <Label className="mb-2">Cómo se distinguen los equipos</Label>

      {MODES.map(({ mode, label, icon }) => {
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

          */}
            <Radio.Content
              className={classNames(
                "flex min-h-12 w-full items-center gap-3 px-3 py-2 transition-colors",
                FOCUS_RING,
                chosen && "bg-segment text-segment-foreground"
              )}
            >
              {icon}
              {/*
                The label alone. Each row used to carry a line explaining itself, and the reason is
                written down: nobody found the kit picker on their own, so the modes are rows with
                words rather than segments of a bar. The words stayed; the second line went, because
                once the question moved out from under the cards it was said twice — the card read
                "Elegís las dos camisetas" and the row below asked "¿Qué camiseta lleva cada uno?".
                Eight lines of text for one setting is its own kind of invisible.
              */}
              <span className={classNames("min-w-0 text-sm", chosen ? "font-medium" : "text-text-muted")}>{label}</span>
            </Radio.Content>
          </Radio>
        );
      })}
    </RadioGroup>

    <KitSettings kit={value} onChange={onChange} />
  </div>
);

export default KitSelector;
