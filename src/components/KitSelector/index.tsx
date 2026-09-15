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
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { toggleButtonVariants } from "@heroui/styles";
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
  /*
    stack — one mode per row (create form, where the kit sits in a narrow column).
    row — three modes across on md+ (edit modal, where the kit has the full dialog width).
  */
  modesLayout?: "stack" | "row";
}

/*
  None of these radios has a Radio.Control, and the control is the only part HeroUI draws a focus
  ring on — so with the keyboard, focus moved through the cards and nothing on the screen said
  where it was. The ring goes on Radio.Content, which is what React Aria marks focus-visible; inset,
  because the cards clip their corners and an outline offset outwards would be cut off.
*/
const FOCUS_RING =
  "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-primary-400";

/*
  One garment size for the whole block, and it has to be asked for in a class and not only in
  `size`. HeroUI sizes every svg inside a toggle button itself — `size-5`, and `sm:size-4` above
  640px — and CSS beats the width/height attributes the icons set, so a shirt handed `size={28}`
  came out 20px on a phone and 16px on a laptop. A utility wins over the components layer at any
  width, which is what puts it back.

  It is a shared constant because the same shirt was being drawn at two sizes on one card: 26 in
  the mode rows, 28 in the buttons under them. Nothing decided that — 26 is what fitted when the
  rows were taller — and the two sat 8px apart, close enough to read as a mistake rather than a
  hierarchy. 28 is also what sets a mode row's height: with the row's own padding it comes to
  exactly the 44px this app asks of anything you press.

  The Equipo A/B tiles are a second size, on purpose: 32px on a phone, 40 from md. Modes stay 28
  so those rows do not grow. Both halves keep the same stack — garment, then the name — even in
  bibs: the team that wears them gets the orange bib, the other gets the outline of a shirt.
  A filled shirt would invent a colour; the contour is just "whatever they turned up in". An
  empty hole collapsed and floated the label in the middle of the tile.
*/
const GARMENT = "size-7 shrink-0";
const GARMENT_SIDE = "size-8 shrink-0 md:size-10";
const ICON_SLOT = "grid h-8 w-8 shrink-0 place-items-center md:h-10 md:w-10";

// Two shirts, because every mode but bibs is a statement about a pair and not about one team.
function Pair({ left, right, rightOutline }: { left: string; right: string; rightOutline?: string }) {
  return (
    <span className="flex shrink-0 items-center -space-x-2">
      <ShirtIcon className={GARMENT} color={left} size={28} />
      <ShirtIcon className={GARMENT} color={right} outline={rightOutline} size={28} />
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
    icon: <BibIcon className={GARMENT} size={28} />,
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
  One segmented control, drawn by HeroUI, rather than two cards drawn here.

  This was a RadioGroup with the dot removed and the fill, border, radius and height written out by
  hand — a segmented control reimplemented badly beside a library that ships one. ToggleButtonGroup
  is that control: `selectionMode="single"` with `disallowEmptySelection` is exactly "one of the
  two teams, always one", `fullWidth` splits it in half, `size="lg"` is the 44px floor, and the
  divider, the attached corners and the inset focus ring all come from the library.

  The edge belongs to the control, not to each half. Per-option borders made the row read as two
  separate buttons that happened to be adjacent; one track around the pair reads as one question
  with two answers. Same --border as the panel and the switch below: border-strong/60 was the
  outline button's edge and made this block a heavier box than the two it sits on.

  rounded-card, not the rounded-3xl HeroUI gives the group: the same radius as the three mode rows
  eight pixels above it. A pill under three 8px rectangles is a different kind of object, and the
  pair is an answer to those rows, not a control of its own — see SEGMENT_HALF, which squares the
  halves so this radius is the only one in the row.

  The edge is `segment-track` in globals.css: painted on ::after, above the options, so a hover
  fill cannot cover it — which is what an outline on the parent did, the moment the pointer sat
  on Equipo A.
*/
const SEGMENT_TRACK = "segment-track";

/*
  Selected is --segment, not HeroUI's --accent-soft.

  The library's wash is 12% of --accent: a violet bar that sat in the same column as Crear
  equipos and read as a second primary. Violet is for actions. --segment is the lighter fill
  this app already uses for "this option is chosen" — a lift, plus the label going from muted
  to white at font-medium, which is the second signal the radios were built around. Hover of
  an unchosen half stays --segment-hover (6% accent over the surface), so the two cannot swap
  clothes.
*/
const SEGMENT_SELECTED =
  "![--toggle-button-bg-selected:var(--segment)] ![--toggle-button-bg-selected-hover:var(--segment)] ![--toggle-button-bg-selected-pressed:var(--segment)] ![--toggle-button-fg-selected:var(--segment-foreground)]";

/*
  Each half, and the only reason it is not left to HeroUI: `.toggle-button` is px-4 with a 12px gap
  and whitespace-nowrap, which fixes a min-content this form cannot pay at 320px. Measured, a half
  wanted 150px — 32 of padding, a 28px garment, 58 of "Equipo A", a 16px caret and two gaps — where
  half the row is 128, so the pair pushed the *form's grid* 28px wide and took the textarea and the
  whole page with it. The tighter padding and gap give back exactly that, and only up to `sm`: on a
  laptop there is room and the library's own spacing is better.

  min-w-0 and the truncated label are the backstop, not the fix. Without them nothing here can
  shrink and a longer word would put the horizontal scroll back; with them the worst case is a
  clipped label rather than a sideways page.

  The focus mark is an outline here and a ring everywhere else in this file, which is not a
  preference. Inside a `.toggle-button` the ring never arrives: measured on a focused half, React
  Aria sets data-focus-visible and --tw-ring-shadow resolves to an inset 2px violet, and yet the
  composed box-shadow comes back transparent in all five of its layers — something in the
  component's own cascade re-declares box-shadow from the default variables and wins. So focus moved
  with the arrow keys and nothing on the screen said where it was, exactly the bug FOCUS_RING exists
  for. `outline` is a different property and survives it; the offset is negative because the track
  clips its corners and an outline drawn outwards would be cut off.

  `outline-solid` is not decoration either. `outline-2` sets the width and leaves the style to
  --tw-outline-style, which HeroUI has already set to `none` on this component — so width and colour
  both landed and the outline still computed to `none`. The style has to be asked for by name.
*/
/*
  A tile on every width: garment over the name, both halves the same shape.

  Stacking without a reserved slot left bibs looking broken — the side that wears nothing had
  only the words, flex-col centered them in the tile, and the bib sat above its label. The
  slot is always there; it is empty when that team is not the marked one.

  h-11 / md:h-10 from `size="lg"` is beaten the same way GARMENT beats the svg rule. min-h-16
  is the phone floor (content is taller); md:min-h-24 is the desktop tile. text-sm stays, so
  "Equipo A" does not out-shout the mode name above it.

  The corners are squared and the track clips them (see SEGMENT_TRACK): the selected fill has to
  reach the control's edge, and a pill-shaped fill inside a rounded box leaves a crescent of
  something else at each end.
*/
const SEGMENT_FOCUS =
  "data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-primary-400";

/*
  The same recipe as selected, weaker. `!` is required: `.toggle-button--ghost` sets
  --toggle-button-bg-hover to --default on the same element, and without it the half under the
  pointer goes to 51% lightness — a grey bar next to the violet wash of the chosen half.
*/
const SEGMENT_HOVER =
  "![--toggle-button-bg-hover:var(--segment-hover)] ![--toggle-button-bg-pressed:var(--segment-pressed)]";

const SEGMENT_HALF = classNames(
  "!h-auto min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-none px-2 py-2.5 text-sm",
  "md:min-h-24 md:gap-2 md:px-3 md:py-3.5",
  SEGMENT_HOVER,
  SEGMENT_SELECTED,
  SEGMENT_FOCUS
);

/*
  A mode row is a half of the control above it turned on its side: same height, same type, same
  squared corners clipped by one track, and only the alignment changes — a row reads left to right
  from its garment to its name, where a half centres its pair.
*/
/*
  The modes are NOT a vertical ToggleButtonGroup, and it was tried.

  It is the obvious idea — the same component as the row below, on its side, so the block is two
  tracks instead of one track and three cards — and it fails on one thing the cards get right: a
  toggle button marks selection with a fill and marks hover with a fill, and on this theme those
  two are close enough that the row under the pointer reads exactly like the row you picked. Two
  rows lit, neither of them obviously the answer. The cards carry selection twice — --segment plus
  the label's weight and colour — and each has its own edge, so there is no state a fill alone has
  to disambiguate.

  Two smaller things went with it: `fullWidth` widens the track but not the rows (`.toggle-button`
  is `w-fit`), so every row needed `w-full` to stop floating centred, and the group's separators
  never showed up against the ghost variant.
*/

/*
  Bibs and shades ask the same question — which of the two teams is the marked one — so they are
  the same control, and only the garment drawn on it changes.
*/
const SideChoice: FC<SideChoiceProps> = ({ label, selected, icon, onSelect }) => (
  <ToggleButtonGroup
    aria-label={label}
    className={SEGMENT_TRACK}
    disallowEmptySelection
    fullWidth
    selectedKeys={[selected]}
    selectionMode="single"
    size="lg"
    onSelectionChange={(keys) => {
      const [side] = [...keys];

      // disallowEmptySelection already stops the set emptying; this is for the type, not the case.
      if (side) onSelect(side as TeamSide);
    }}
  >
    {TEAM_SIDES.map((side, index) => {
      const chosen = side === selected;

      return (
        <ToggleButton key={side} id={side} className={SEGMENT_HALF} variant="ghost">
          {/* Inside each button but the first: that is where the group hangs its divider. */}
          {index > 0 && <ToggleButtonGroup.Separator />}
          <span className={ICON_SLOT} aria-hidden>
            {icon(side)}
          </span>
          {/*
            Chosen twice, the way the mode rows above say it: the fill, and the label going from
            muted to white at font-medium.
          */}
          <span className={classNames("truncate", chosen ? "font-medium" : "text-text-muted")}>Equipo {side}</span>
        </ToggleButton>
      );
    })}
  </ToggleButtonGroup>
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

  The row wears the segmented control's own clothes so that all three modes present one shape: the
  same track, and triggers drawn with toggleButtonVariants rather than a second set of paddings and
  radii written out here. HeroUI's composition guide is explicit that its BEM classes apply to any
  element, and the group's classes are what give the pair its attached corners and its halves.

  What they never get is a selected state, because they are not a choice — each one opens a colour.
  The caret is the only thing saying so, and it is the only thing telling this row apart from the
  identical pair in the other two modes.
*/
const SHIRT_TRIGGER = toggleButtonVariants({ size: "lg", variant: "ghost" });

interface ShirtChoiceProps {
  kit: ShirtsKit;
  onChange: (kit: ShirtsKit) => void;
}

const ShirtChoice: FC<ShirtChoiceProps> = ({ kit, onChange }) => (
  <div
    className={classNames(
      "toggle-button-group toggle-button-group--horizontal toggle-button-group--full-width",
      SEGMENT_TRACK
    )}
  >
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
            className={classNames(SHIRT_TRIGGER, SEGMENT_HALF, FOCUS_RING)}
            aria-label={`Camiseta del equipo ${side}`}
          >
            <span className={ICON_SLOT} aria-hidden>
              <ShirtIcon className={GARMENT_SIDE} color={hex} outline={edge !== hex ? edge : undefined} size={32} />
            </span>
            <span className="flex min-w-0 items-center justify-center gap-1">
              <span className="truncate">Equipo {side}</span>
              {/* See SHIRT_TRIGGER: this is the only thing saying these two open rather than choose. */}
              <ChevronDownIcon className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
            </span>
          </ColorPicker.Trigger>
          {/* Six swatches in one row at HeroUI's own size, and never wider than the screen. The
              hex field that came with the demo is gone: this is a group chat picking a shirt, and
              a colour anyone here wants is already under the thumb.

              max-w-none on the area: HeroUI ships color-area with max-w-56, and this popover is
              wider than that, so the gradient sat left with a dead strip of overlay on the right.
              Same w-full on the swatches and the hue bar so the three stack as one column. */}
          <ColorPicker.Popover className="flex w-[min(100vw-1.5rem,17rem)] flex-col gap-3 p-3">
            {/* The sideline's usual answers, first and one tap away. */}
            <ColorSwatchPicker className="flex w-full justify-between gap-2">
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

            <ColorArea.Root className="h-40 w-full max-w-none rounded-lg">
              <ColorArea.Thumb />
            </ColorArea.Root>

            <ColorSlider.Root className="w-full" channel="hue" colorSpace="hsb">
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
  A question again. It was one, then a noun while every card still carried a line of explanation
  under its name — two voices describing the same thing, so the shorter one won. With those lines
  gone this row is the only thing on the screen saying what the two buttons are for, and a question
  is what asks for an answer.
*/
const QUESTIONS: Record<KitMode, string> = {
  shades: "¿Quién va de claro?",
  shirts: "¿Qué camiseta lleva cada uno?",
  bibs: "¿Quién lleva la pechera?",
};

/*
  `panel` and p-4, which is the recipe the switch directly below it already uses.

  This card used to write the recipe out by hand — rounded-card, the border, the surface — arriving
  at the same thing minus the shadow, and then at px-3 py-2.5. Two panels stacked with 8px between
  them, one inset 12px and the other 16, one lifted off the page and the other flat: measured, the
  question in this card started 4px to the left of the label in that one, which is the kind of
  thing you cannot name when you look at it and cannot unsee once it is named. There is one panel
  recipe in globals.css; anything that is a panel takes it.
*/
const KitSettings: FC<{ kit: Kit; onChange: (kit: Kit) => void }> = ({ kit, onChange }) => (
  <div className="kit-settings panel flex flex-col gap-2 p-4">
    {/*
      On the screen, not only in the accessibility tree. It used to sit inside the chosen card;
      moving the row out from under the cards left two buttons reading "Equipo A" and "Equipo B"
      with nothing saying what answering them does — which is the whole of why nobody could tell
      they were allowed to swap the sides, or that Colores opens a colour.
    */}
    <span className="text-sm text-text-muted">{QUESTIONS[kit.mode]}</span>
    {kit.mode === "shades" && (
      <SideChoice
        label={QUESTIONS[kit.mode]}
        selected={kit.lightTeam}
        icon={(side) => {
          const light = kit.lightTeam === side;

          return (
            <ShirtIcon
              className={GARMENT_SIDE}
              color={light ? LIGHT_HEX : DARK_HEX}
              outline={light ? undefined : DARK_EDGE}
              size={32}
            />
          );
        }}
        onSelect={(lightTeam) => onChange({ mode: "shades", lightTeam })}
      />
    )}

    {kit.mode === "shirts" && <ShirtChoice kit={kit} onChange={onChange} />}

    {kit.mode === "bibs" && (
      <SideChoice
        label={QUESTIONS[kit.mode]}
        selected={kit.bibTeam}
        icon={(side) =>
          side === kit.bibTeam ? (
            <BibIcon className={GARMENT_SIDE} color={BIB_HEX} size={32} />
          ) : (
            <ShirtIcon className={classNames(GARMENT_SIDE, "text-text-muted")} color="currentColor" empty size={32} />
          )
        }
        onSelect={(bibTeam) => onChange({ mode: "bibs", bibTeam })}
      />
    )}
  </div>
);

const MODES_LABEL = "Cómo se distinguen los equipos";
const MODES_LABEL_ID = "kit-modes-label";

interface ModeChoiceProps {
  value: Kit;
  onChange: (kit: Kit) => void;
}

/*
  One track with three rows in it, sharing SEGMENT_TRACK with the row of two teams below.

  They were three bordered cards 8px apart, and that was the whole of why the two controls read as
  different components: three separate boxes say "three objects" while the pair below says "one
  object with two parts", for the same question asked twice. Same recipe, one border, and hairlines
  where the rows meet — `divide` rather than a border per row, so the outer edge is drawn once.

  The rows keep the RadioGroup, though, and that is the part the ToggleButtonGroup attempt got
  wrong: a radio row says "chosen" twice, with --segment *and* with its label going from muted to
  white at font-medium, and a toggle button says it once with a fill it also uses for hover.
*/
const ModeCards: FC<ModeChoiceProps & Pick<KitSelectorProps, "modesLayout">> = ({ value, onChange, modesLayout }) => (
  <RadioGroup
    aria-labelledby={MODES_LABEL_ID}
    /*
      **:data-[slot=radio]:mt-0 — HeroUI gives every radio of a vertical group mt-4, on top of any
      gap, so the rows sat 24px apart when the class said 0.

      The dividers turn with the layout: stacked they are the line between two rows, three across
      (the Editar dialog) they are the line between two columns.
    */
    className={classNames(
      SEGMENT_TRACK,
      "divide-border **:data-[slot=radio]:mt-0",
      modesLayout === "row"
        ? "grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0"
        : "flex flex-col divide-y"
    )}
    value={value.mode}
    onChange={(mode) => onChange(STARTING_KIT[mode as KitMode])}
  >
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
            /* No border and no radius of its own: the track around the three draws both, once. */
            className={classNames("flex-col items-stretch transition-colors", !chosen && "segment-option")}
          >
            {/*
              The chosen option is --segment: a lighter fill, not a second violet. Crear equipos
              is the action; this is which mode is on. The label going from muted to white at
              font-medium is the other half of the signal — a fill alone is what a toggle button
              uses for hover too.

              min-h-11, like every other thing on this form you can press. It was min-h-12, which
              is the exact habit the Button wrapper exists to have broken: a 48px box around 14px
              text, sitting 4px taller than the buttons under it and Confirmar at the foot.
            */}
            <Radio.Content
              className={classNames(
                "flex min-h-11 w-full items-center gap-3 px-3 py-2 transition-colors",
                FOCUS_RING,
                chosen ? "bg-segment text-segment-foreground" : undefined
              )}
            >
              {icon}
              <span className={classNames("min-w-0 text-sm", chosen ? "font-medium" : "text-text-muted")}>{label}</span>
            </Radio.Content>
          </Radio>
        );
      })}
  </RadioGroup>
);

const KitSelector: FC<KitSelectorProps> = ({ value, onChange, modesLayout = "stack" }) => (
  <div className="flex flex-col gap-2">
    {/*
      Hoisted out of both pickers so neither has to place it: it used to live inside the RadioGroup,
      where the three-across layout needed col-span-full to stop it becoming a fourth column. Each
      group names itself off it with aria-labelledby.
    */}
    <Label className="mb-2" id={MODES_LABEL_ID}>
      {MODES_LABEL}
    </Label>

    <ModeCards modesLayout={modesLayout} value={value} onChange={onChange} />

    <KitSettings kit={value} onChange={onChange} />
  </div>
);

export default KitSelector;
