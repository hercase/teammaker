# Teammaker

Splits a list of players pasted from a WhatsApp group into two football teams. Everything lives in
`localStorage`; there is no server, no database and no per-match URL, and that is a decision, not a
gap.

## Who actually uses it

A group that plays on Tuesdays and Wednesdays, at different times and pitches. The link sits in the
group description and whoever is organising that week opens it. The most common thing that happens
after the teams exist is that somebody drops out and is replaced.

Two facts worth keeping in mind, because they have decided most of the design:

- **Nobody sends the link. Everyone sends a picture.** That is why there is a Compartir button that
  draws the teams to a PNG and fires the native share sheet, and why the screen is composed to look
  right as an image.
- **Nobody discovered the kit picker on their own.** Features have to be visible on the screen
  someone is already looking at, not one tap away — which is why the kit modes are three labelled
  rows with a line of explanation each, not three segments of a bar.

## Commands

```bash
yarn dev          # always http://localhost:3200 — the e2e suite uses the same port
yarn run check     # tsc --noEmit && next lint && vitest run — run this before saying anything works
yarn test
yarn test:e2e     # Playwright, in e2e/ — measures the screen; needs (or starts) the dev server
yarn build
```

- **`yarn`, never `npm install`.**
- **`yarn run check`, not `yarn check`** — `check` is a yarn 1 builtin and silently does something
  else.
- **Never run `next build` or `rm -rf .next` while `next dev` is running.** They share `.next`; the
  dev server starts 404ing its own chunks and the page stops hydrating, which looks exactly like a
  React bug and is not one. Stop dev first, build, then restart dev.

## Conventions

- `interface` before `type`; `type` only for unions and aliases.
- No enums — use a `Record` map or a `const` array with a derived union.
- Function components only.
- Code and comments in **English**. Everything a user reads is in **Spanish** (Rioplatense: "Pegá",
  "Necesitás").
- Comments explain *why*, especially where the obvious thing was tried first and failed. Several
  comments in this codebase exist to stop someone re-introducing a bug; do not strip them.

## Component library

The visuals are **[HeroUI v3](https://heroui.com/en/docs/react/components)** (React Aria underneath),
not hand-built components. Button, TextField, TextArea, Switch, Modal, AlertDialog and Dropdown all
come from it. There is no provider: `@import "@heroui/styles"` after `@import "tailwindcss"` and
`data-theme="dark"` on `<html>` is the whole setup.

**Check the API, never remember it.** `AGENTS.md` is HeroUI's own generated index and `.heroui-docs/`
holds the full docs and every demo, offline — regenerate both with
`npx heroui-cli@latest agents-md --react --output AGENTS.md`. `.heroui-docs/` is gitignored because
it is 7MB and reproducible. `.mcp.json` wires their MCP server as well. The installed package under
`node_modules/@heroui/react/dist` is the last word: it is the version actually running, and its
source carries the anatomy notes the website does not.

Five things bit during the migration and will bite again:

- **`validationBehavior="aria"` on every field.** The default is `"native"`, and then the browser
  refuses the submit before react-hook-form ever runs: no error recorded, nothing turns red, the
  button looks dead.
- **`register` goes on the inner `Input`/`TextArea`, never on `TextField`** — TextField's onChange
  hands back a string, which `register` cannot consume.
- **`TextField` takes the form's `value` on every render, not `defaultValue`.** React Aria keeps the
  value in its own state and writes it into the DOM each render, while `setValue` assigns
  `node.value` and fires no event — so everything the app set from code was erased on the next
  render, silently. `defaultValue` looked like the fix and only covered the first render: the X left
  the old name in the box, Pegar filled the form and left the box empty, and Editar opened with three
  blank fields. Any field the app writes to from code must be handed `value` (defaulted to `""`, so
  it is controlled from the first render and never switches modes).
- **The row menu hangs off the ⋮, not off the row.** React Aria reads the end of a drag as a press,
  so a row that was both drag source and menu trigger opened the menu on every drag.
- **`.Content` is the clickable part; the control goes inside it and the description outside.** This
  is the anatomy of `Switch` and `Radio` alike, and getting it backwards fails silently in the worst
  way: with `Switch.Control` as a sibling of `Switch.Content`, the lever was decoration — tapping
  the words toggled the switch and tapping the switch itself did nothing, on every device. The
  library states it in the source: "Switch.Content — the clickable SwitchButton label wrapping the
  control + Label. Keep Description/FieldError as siblings of Switch.Content." The upside is that
  `Radio` makes the kit card's old hazard structurally impossible: its settings are siblings of
  `Radio.Content`, so they can be operated without re-picking the mode.
- **Never name a Tailwind `@utility` after a HeroUI class.** HeroUI draws its parts with plain class
  names — `input`, `label`, `button` — so an `@utility input` is not a utility this app opts into, it
  is a rule that lands on every HeroUI field and wins. Two of them were doing exactly that, and it
  was invisible in the source because no component ever wrote `className="input"`: fields were
  repainted with the wrong fill, a border HeroUI does not ask for, and the wrong radius, which is the
  whole reason they did not look like the library's. The TextArea was the tell — it collides with
  nothing and was the one field that looked right. Anything a component needs goes in that
  component's own `className`.

Yarn 1 does not install peer dependencies: `react-aria`, `react-aria-components` and the three
`@react-aria/*` packages had to be added by hand.

## Design system

**`src/app/globals.css` is the single source of truth.** Tokens, surface recipes, the type scale and
the z-index scale all live there with the reasoning attached. Read it before writing any styling.

- **Dark only.** No light theme, no `dark:` variant, no theme switcher.
- **The theme is HeroUI's theme builder export, with our violet in it.** The whole token set —
  `--background`, `--surface`, `--surface-secondary/tertiary`, `--field-background`, `--field-border`,
  `--segment`, `--separator`, `--radius`, `--field-radius` — is declared in one `[data-theme="dark"]`
  block, in the shape the builder produces, not reasoned out by hand. Setting `--accent` alone and
  leaving the rest at the library's defaults left every neutral tinted towards *its* hue; the hue is
  293.76, which is `#7039d0` measured in OKLCH, so the greys belong to the brand. `--color-canvas`,
  `--color-surface` and the text tokens are aliases of those, so what this app draws by hand stands
  on the same ground as its Button and Modal. Pointing it the other way round — our palette imposed
  on HeroUI — is what made the first attempt look exactly like what it replaced.
- **Violet is the brand and stays**, but it is for actions, not for everything. An early pass had 23
  `primary` uses against 4 `secondary` and the whole app read as one violet mass.
- **Selection is a lighter fill, never an outline.** HeroUI marks a chosen segment by lifting its
  background — `--segment` is literally the token for it — and this app used to draw a white
  `ring-text` border instead, left over from before the migration. Two different languages for the
  same idea on the same screen, and the outline one was ours.
- **Hover and press of an unchosen option are the same wash as selected, weaker.** Selected is
  `--segment`, the lift HeroUI named for this. `--accent-soft` (12% `--accent`) was tried and sat
  in the same column as Crear equipos: a second violet, and the brand is for actions. Unchosen
  hover/press are 6% / 8% of `--accent` over `--surface`, under selected. Ghost's own hover is
  `--default` at 51% and has to be overridden with `!important`.
- **A control's boundary needs 3:1, and text contrast does not cover it.** WCAG 1.4.11 is a separate
  rule from 1.4.3, so a screen can pass every text check and still ship controls nobody can see.
  Two did: the unset switch measured **1.20:1** against its card — not a dim toggle, not visibly a
  toggle — and the outline button's edge **1.07:1**. Structural edges (panel borders, separators)
  are allowed to stay quiet; anything you press is not. The suite measures both now, and measures
  an alpha border by compositing it over its actual ground, because reading the swatch alone
  reports it as opaque and says 6:1 where the truth is 1.7:1.
- Surfaces go `canvas` → `surface` (panels) → `surface-raised` (rows) → `surface-hover`, and all of
  them sit on the canvas's own hue. They used to sit 18° bluer, which read as a blue-grey panel on a
  violet page — two palettes sharing a screen. In dark mode the contrast between two near-black
  fills is worth almost nothing (1.14:1, and no tuning wins it back), so what actually separates a
  panel from the page is **its border and the brightness of its text** — that is where the contrast
  budget is spent. Check both when you touch the ramp.
- `InfoCard` is the one surface that carries the brand violet, banked into a corner. Nothing else
  gets a *brand* tint; a second one would stop it meaning anything. The migration to HeroUI's
  `Card` dropped it once and the match card became a third grey box over the two team panels.
  It is a radial gradient of `--color-primary-600` at **40%** in the top-left: at 28% it measured
  1.24:1 against a team panel (invisible, by the rule below); at 55% the muted "Creado por" line
  fell to 4.18:1 at the corner. 40% keeps it at 4.87:1. The card also carries three 16px
  `20/solid` icons (place, date, author), `aria-hidden`, one shared left edge.
- **Team panels are washed with their own kit**, 7% of the garment mixed into `--surface` for the
  panel and into `--surface-secondary` for the rows (`team-panel` / `team-row` utilities, fed by
  `--team-color`). That is colour with a meaning — *which* team — not decoration, so it does not
  break the rule above. 12% was tried first and the bib side came out plainly orange. A side that
  wears nothing (the team without bibs) leaves `--team-color` unset and draws the plain surface.
  Names on the washed rows measure above 13:1 for every preset; the 12px surname above 5.5:1.
- **One font, Inter, and HeroUI's scale.** Inter is what the library sets `--font-sans` to, so its
  Button, Card and Input are drawn in it whatever we choose; a second display family (Plus Jakarta
  Sans, before it Big Shoulders) only meant the app disagreed with itself wherever we had not
  reached. Hierarchy is weight and size on HeroUI's steps — 24/600, 18/600, 16/400, 14, 12 — not a
  second face. `--font-mono` is for the pasted list and nothing else.
- **Radius has one knob.** HeroUI derives its whole scale from `--radius` (`xs` ×0.25, `sm` ×0.5,
  `xl` ×1.5) and `--field-radius` is ×1.5 of it. The theme builder's export hardcodes
  `--field-radius`, which cuts that derivation — the base said small and the fields stayed at 12px.
  Left to derive, and `--radius-card` is `calc(var(--radius) * 2)` so panels stay a step rounder
  than a field however the base is set.
- **`--default` paints the team counter's `Chip`** (soft variant, which is `--default` at 50%) and
  a toggle button's unselected state. It used to paint Mezclar equipos too, and that 51% grey
  read as the button being off. Ghost (no chrome) made it disappear. It is outline now, same
  3:1 edge as Nueva lista / Editar. Move the token and check the chip and the toggles.
- **The draw switch is turquoise on *and* off, and which two turquoises is measured.** Off used to
  be `--default`, the neutral grey, which said "asleep" about a setting whose off value is a real
  choice (the list's own order). Two things have to clear 3:1 at rest: the track against its card,
  or there is no visible control, and the white thumb against the track, or nothing says which side
  it is on. Across the whole cyan ramp exactly **two steps satisfy both** — `secondary-600` off
  (3.87:1 track, 4.49:1 thumb) and `secondary-500` on (5.53:1 and 3.15:1). Everything lighter loses
  the thumb (`secondary-400`, which the on state was, leaves it at **2.13:1**) and everything darker
  loses the track. The step between them is gentle on purpose; the thumb's position and the arrows
  are what carry the state and the colour agrees with them. Set through `--switch-control-bg` and
  `--switch-control-bg-checked`, the tokens `.switch` declares, never by painting `.switch__control`
  — that has to win a specificity fight with the checked rule. `-checked-hover` is a step brighter
  and is the one ratio under the floor, so the suite measures with the pointer parked away.
- **`--field-background` sits one step above `--surface`, on purpose.** The builder ships them
  identical, which is fine where fields sit on the page and invisible where they sit in a dialog:
  the Editar fields measured 1.00:1 against the dialog body — not dim, gone. Anything that changes
  the surface ramp has to be checked inside a modal, not only on the page.
- The shirt presets sit 15 saturation points above the interface accents, on purpose: they are
  garments, and at 26px seven in a row the muted set read as grey versions of themselves. +30 was
  rendered beside it and is the neon sheet the palette was pulled back from. `kit.ts` has the note.
- Cyan (`secondary`) means *came in*; rose (`error`) means *went out*. Consistent in the team list
  and the history.
- **Buttons are HeroUI's `lg`, and nothing overrides a height.** Its scale is sm 36 / md 40 / lg 44,
 so lg *is* the 44px touch floor. What was here before forced `min-h-12` on top of md: a 48px box
 around 14px text, which reads as a button with too much air rather than a bigger button. The kit's
 three mode rows kept that 48 after the buttons gave it up, which made the row nobody has to hit
 accurately the biggest target on the card — 4px taller than the two buttons right under it, the
 fields above it and Crear equipos at the foot. 44 is the floor, not a size to beat.
- **There is one panel recipe and one garment size.** `panel` in `globals.css` is the whole of what
 a panel is; the kit's settings card used to write it out by hand and arrive at the same thing
 minus the shadow, at `px-3 py-2.5`. Stacked 8px under the draw switch, that put one panel's text
 4px in from the other's and left one of the two flat on the page — invisible until measured,
 obvious afterwards. The garment had the same split: 26px in the mode rows, 28px in the buttons
 8px below them, which is one shirt at two sizes on one card. `GARMENT` is the size, and with the
 row's own padding it is what makes the row exactly 44.
- Touch targets are at least 44px with at least 8px between them. `gap-1` between tappable rows is a
  known anti-pattern here; it was introduced once and reverted. HeroUI's own fields are 40px, so
  every `Input` carries `min-h-11` in its own className — and `w-full`, because its Input sizes to
  its content and the clear button is positioned against the wrapper. **The 8px is between separate
  controls, and the two halves of a segmented control are not that** — they share an edge because
  they are one control, and the 8px gap the kit's sides used to have is exactly what made them read
  as two unrelated buttons.

### Layout: the `min-w-0` chain

A flex or grid item is never narrower than its own content unless told otherwise. One long player
name used to widen the page itself and scroll the whole layout sideways on a phone. `min-w-0` is
therefore required on **every** link in the chain: `<main>` (a grid item), the page's `max-w-md`
wrapper, the teams row, each panel, the row button, and the name itself. Removing any one of them
brings the horizontal scroll back. Verify at 320px, not just 390px.

The page's side padding matches the vertical gap between its blocks (20px either way). Keep them
equal.

## The two models worth knowing

### `Kit` — how the teams tell each other apart

A discriminated union in `src/types.ts`, three mutually exclusive modes:

| mode | means |
| --- | --- |
| `shades` | light shirts against dark ones. **The default**, because nobody has to own anything. |
| `shirts` | a colour each, from seven presets in `src/utils/kit.ts` |
| `bibs` | which of the two teams wears the bibs |

Rules that are enforced and tested: two teams can never wear the same shirt (picking the other
team's colour **swaps** them); in bibs mode only the wearing team is labelled, in one line under the
teams rather than a label in both headers; `parseKit` distrusts persisted JSON and falls back to the
default.

**A shirt is any hex, and the seven presets are swatches now, not the vocabulary.** The group wears
what it owns; a list of seven could only ever be a guess at it. What the presets were carrying is
kept by measurement instead:

- **A dark garment on a dark interface cannot be solved with a fill.** Measured against the panel a
  charcoal reaches 1.57:1 and going darker trades that for 1.06:1 — the shape vanishes either way.
  `garmentEdge` computes the contour from contrast against `--surface`, at the 3:1 WCAG 1.4.11 asks
  of a boundary. It used to be an `edge` hardcoded onto the one preset that needed it; with any hex
  on offer there is no list to mark up, and the rule was never about black.
- **A colour that is not a preset has no name, so no shirt is named.** `kitLabel` titles both panels
  `Equipo A` / `Equipo B`, the way bibs mode titles its own. Naming a teal "Verde" because green is
  the nearest of six is not a shorthand, it is a title nobody chose and nobody can correct — and the
  header is read off the shared picture. Half a rule, right for six colours and wrong for the rest,
  is worse than none. `nearestPreset` stays for the v0 migration and nothing else.
- **Two teams still cannot wear the same shirt.** `freeShirt` has two candidates, not one: a single
  fallback cannot move a team off itself, and two navies both migrated to blue, were both replaced
  with blue, and stayed identical.
- **A hex has two spellings and `setShirt` normalises before it compares.** `KIT_PRESETS` and
  `tinycolor` are lowercase; react-aria's `Color.toString("hex")` — what the `ColorPicker` hands
  over — is upper. Compared raw, picking the colour the other team was already wearing read as a
  *different* colour, so nothing swapped and the kit came out
  `{ teamA: "#6085EE", teamB: "#6085ee" }`: both teams in the same blue, the one thing this screen
  must never say. It could only appear once the presets became a picker, since until then every hex
  came from the same table.

**The three modes are the same control, and the control lives under all three.** Each mode is a row
with a label; below the three sits one settings row that answers whichever is chosen, and every
mode's answer is the same shape — which of the two teams. That row is why the block cannot change
height: picking Colores used to make the card 100px taller and shove the rest of the form down.

This reverses two earlier decisions on purpose, and the reasons they were made no longer hold:

- Settings used to sit inside the chosen card, because under all three they "read as a second
  unrelated question". They did, while Colores was two labelled rows of seven shirts and the others
  were two buttons — three different things in one frame. They are one thing now.
- Each row used to carry a line of explanation, because nobody found the kit picker on their own.
  The rows and their words stayed; the second line went once the settings row got a visible label,
  since the card said "Elegís las dos camisetas" and the row under it asked the same thing again.
  Eight lines of text for one setting is its own kind of invisible.

The settings row is labelled with a **question**: `¿Quién va de claro?` / `¿Qué camiseta lleva cada
uno?` / `¿Quién lleva la pechera?`. This reverses the noun the row used to carry (`Van de claro`),
and the reason is that the row moved out from under the cards: with the per-row explanations gone it
is the only thing on the screen saying what the two buttons do, and a question is what asks for an
answer. **The trade is real and worth re-reading** — it is the only interrogative on a form whose
every other field is labelled with a noun.

**The row is one `ToggleButtonGroup`, not two cards.** `selectionMode="single"` with
`disallowEmptySelection` *is* "one of the two teams, always one"; `fullWidth` splits it in half and
`size="lg"` is the 44px floor — on a phone. It replaced a `RadioGroup` with the dot removed and the fill, border,
radius and height written out by hand — a segmented control reimplemented badly next to a library
that ships one. React Aria renders it as `role="radio"` with `aria-checked`, so the announcement is
the same as the radios it replaced; the suite reads the chosen side off that, not off an input.

**It is not quite the radio group it announces itself as**, and the suite pins the difference: the
arrow keys move focus *without* choosing, and `Space` is what picks. The ARIA pattern for
`role="radio"` asks that arrows check as they move, and a real `RadioGroup` does; React Aria pairs
radio roles with toolbar-style keys. Asserted as it behaves rather than as it ought to, so a library
fix shows up as a failure instead of passing unnoticed.

Four things about it are ours and are load-bearing:

- **The edge belongs to the control, not to each half, and it is painted on `::after`.** Per-option
  borders made the row read as two adjacent buttons; one track around the pair reads as one
  question. Same `--border` as `panel` — `border-strong/60` (the outline button) made the mode
  block a heavier box than the settings and the switch stacked under it. A border on the parent is
  2px of height (the pair measured 46 next to mode rows of 44) and an inward outline on the parent
  disappears under an opaque hover fill. `::after` sits above the options, costs no layout, and
  cannot be covered.
- **A half is a tile: garment over the name, on every width.** `lg` is `h-11 text-base md:h-10
  rounded-3xl`. The pair used to follow the mode rows at 44; from `md` it grew and left the phone
  on the small bar. In bibs the other team wears nothing, and an empty hole collapsed — the
  group stretched both tiles to the taller one, so "Equipo A" floated in the middle while the
  bib sat above "Equipo B". The other half now draws the outline of a shirt (`empty` on
  `ShirtIcon`): a filled shirt would invent a colour, and nothing there floated the label.
  `min-h-20` on a phone, `md:min-h-24` on a laptop, `text-sm`, squared corners.
- **The chosen half is `--segment`, overridden per button.** HeroUI marks a selected toggle with
  `--accent-soft`, 12% violet: it sat next to Crear equipos and read as a second primary. `--segment`
  is the lift the token is for (about 1.9:1, label above 9:1). It goes on each `ToggleButton` and
  **not** on the group: `.toggle-button` declares the token on itself, and a declaration on the
  element beats one inherited from a parent.
- **The halves pay for their own width at 320px.** `.toggle-button` is `px-4` with a 12px gap and
  `whitespace-nowrap`, which fixed a min-content of **150px** per half where half the row is 128 —
  so the pair widened the *form's grid* and took the textarea and the whole page with it (348px at a
  320 viewport). `px-2`/`gap-1.5` up to `sm` gives back exactly that; `min-w-0` and a truncated
  label are the backstop, so the worst case is a clipped word rather than a sideways page.
- **The focus mark is an `outline`, and everywhere else in that file it is a ring.** Inside a
  `.toggle-button` the ring resolves in `--tw-ring-shadow` and never reaches `box-shadow` — measured,
  all five composed layers come back transparent — so focus moved with the keys and nothing said
  where it was. `outline` is a different property and survives it. It needs `outline-solid` by name
  as well: `outline-2` leaves the style to `--tw-outline-style`, which HeroUI has already set to
  `none`, so the width and the colour both landed and the outline still computed to `none`.

In Colores the two buttons open a `ColorPicker` — six swatches, then the area and the hue slider —
and wear the segmented control's own clothes (`toggleButtonVariants`, the composition path HeroUI
documents) so all three modes present one shape. What they never get is a selected state, because
they are not a choice: each opens a colour. The caret is the only thing saying so, and the only
thing telling this row apart from the identical pair in the other two modes. No hex field: this is a
group chat picking a shirt. This also retired a trade the picker used to carry — seven targets
sharing a card came out 39px wide on a 390px phone and 29px at 320, under the 44px this app asks.

One HeroUI trap lives here: **it sizes every `svg` inside a toggle button itself** (`size-5`, and
`sm:size-4` above 640px), and CSS beats the `width`/`height` attributes an icon sets, so a garment
handed `size={28}` came out 20px on a phone and 16px on a laptop. A utility class wins over the
components layer at any width, which is what `GARMENT` is for.

The chosen mode, the chosen sides and the draw toggle are all remembered as they are picked, not on
submit — `remember()` takes a partial. The group plays the same way every week.

### `Player.team` — which side a row is on

**A team is written on the row, not derived from where it sits in the list.** `assignTeams` draws
the sides once, when the match starts (first half A, the odd one to A); `splitTeams` only reads
`player.team` back. The store is at `version: 2` and the migration applies the old rule once, so a
match already open on a phone stays on the two teams it was showing.

It used to be derived: team A was the first `ceil(n/2)` rows, and `insertionIndex` tried to splice
a new row where that halfway point would land on the right side of it. That arithmetic cannot win,
because the rule can only ever express `|A| = |B|` or `|A| = |B| + 1` — and **Sumar jugador exists
precisely to break that**. Adding to B on an even list, or to A on an odd one, put the newcomer on
the side that asked for them and pushed a bystander across to the other. Measured, from the group's
own screenshots: a 5v5 with a drop-out covered in Oscuras came out **6v4 with Keis in Claras**, and
"Falta uno en Claras" plus Sumar jugador on Claras left Claras just as short.

Two consequences worth keeping in mind:

- **A new row is pushed to the end carrying its side.** Panel order is list order, so whoever
  signed up last shows last. There is no index to compute.
- **A drag across the gap swaps the sides too.** `exchangePlayers` hands each player the other's
  slot *and* the other's `team`; swapping only positions left both of them where they were.

### Player names

`generatePlayer` in `src/utils/index.ts` is the only door a name comes through — the pasted list,
Renombrar and Reemplazar all use it. The first word is the name; what follows is cut down to **the
first surname only**, because the bracketed half exists to tell two Matis apart and a row is one
line wide.

The hard part is that a surname is not always one word. Leading particles (`de`, `del`, `la`, `di`,
`van`, `von`, `mac`, `san`, …) are taken along with the word that ends them, so:

```
Ezequiel Hernandez Palomero de la Mancha  →  Ezequiel (Hernandez)
Ezequiel Di Stefano                       →  Ezequiel (Di Stefano)
Nico de la Mancha                         →  Nico (de la Mancha)
Fede Camino                               →  Fede (Camino)
```

A character cap is the backstop for one absurd word, not the rule. `usePlayersStore` is at
`version: 1` and migrates names saved before this rule, history included.

Duplicate names get a small ordinal via `duplicateTags`, decided on what is actually drawn (so a
substitute counts, not the player they replaced).

## Sharing

`src/hooks/useShareTeams.ts` draws the match to a PNG and then splits by device, which is not
cosmetic:

- **Touch** (`pointer: coarse`) → the system share sheet. One tap and it is in the group.
- **Everything else** → the PNG is written to the clipboard here as a single `image/png`, and the
  screen says so. macOS offers Copy inside its own share sheet, which is what you reach for, and it
  writes several pasteboard flavours at once; WhatsApp pastes more than one and **the same teams
  arrive twice**. Never send a desktop through that sheet.
- No clipboard API → download.

A `useRef` guard, not the `isSharing` state, stops a double tap: state applies on the next render,
so two taps inside one frame both read the old value and both opened a share sheet.

What it
photographs is **not** the screen: it is `ShareCard`, a second copy of `MatchSummary` rendered only
while sharing, parked off-screen at `left: -9999px` and a fixed 400px wide. Both of those are
deliberate and were arrived at the hard way:

- **Off-screen**, because the first attempt drew the wordmark into the page itself. On screen the
  logo is already in the sticky header, which is not part of what gets drawn — so the page showed
  two TEAMMAKER titles for as long as the share sheet stayed open.
- **Fixed width** (520px), because otherwise the picture is a photograph of whoever's screen made
  it: a phone produced two narrow columns and a laptop two wide ones, for the same twelve players.
  Once the width is ours to pick it stops being a phone's width — the extra 120px is what lets
  "Fede (CAMINO)" and "Ezequiel (HERNANDEZ)" print in full instead of being cut to fit a screen the
  picture is never shown on.

`MatchSummary` exists so the screen and the card cannot drift apart. If you add something to the
match view, add it there and it appears in both.

The rasteriser is [`@zumer/snapdom`](https://snapdom.dev), imported on the tap rather than with the
screen. It takes `exclude: ['[data-share="hide"]']` with `excludeMode: "remove"` — that is how the
row menus stay out, and a CSS selector rather than a hand-written predicate because the menu icon is
an `<svg>` and an `SVGElement` is not an `HTMLElement`, which the hand-written one got wrong.

Two things that still bite:

- snapdom sizes the output from the **source element**, so growing the clone in an `afterClone`
  plugin crops the result. Anything the picture needs must be in the card itself.
- A detached clone inherits nothing, so `currentColor` drew the logo black. `Logo` binds its fill to
  `var(--color-text)`.

The card is still laid out by the real viewport's media queries, so `sm:` padding inside it applies
on a desktop and not on a phone — about 16px of height between the two. Container queries would
close that if it ever matters.

## The domain

The app lives at **teammaker.com.ar** (`URL_BASE` in `src/utils/site.ts`; metadata, canonical,
robots, sitemap and the JSON-LD all read it). The `.com.ar` was chosen over a themed TLD on
purpose: Google gives new gTLDs no keyword advantage but does favour a country code for local
searches, and `.com.ar` is what an Argentine types by reflex. NIC Argentina delegates it straight to
`ns1/ns2.vercel-dns.com`; `www` redirects to the apex from the Vercel project's domain settings.

**The old host redirects from the browser, not the server, and carries localStorage with it.**
localStorage belongs to an origin, so a server redirect off `teammaker.vercel.app` would land every
phone on the new domain with no match, no saved name and the default kit. `handoff()` runs as an
inline script in `<head>` — ahead of the bundle, because zustand's persist reads storage the
moment a store is created — moves what the old host holds in the URL fragment, and the new host
writes it back only where it has nothing of its own. The fragment is untrusted input: known keys
only, JSON objects only. A new persisted store must be added to `STORAGE_KEYS` or it is left
behind on the next move.

Whoever arrives that way sees **`MovedNotice` once**: the handoff sets `moved-notice`, the modal
reads it, "Listo" writes `seen`. The move is otherwise invisible, and its one real risk is the link
in the group description pointing at the old host for ever, so the notice asks for exactly that and
has the link ready to copy. The dev bar's "Llegar desde el dominio viejo" shows it on localhost.

**Temporary, and dated: revisit after 2026-11-30.** Once the phones that use the app have all been
through the old link once, swap the handoff for a permanent server 308 from `teammaker.vercel.app`
(robots and people alike — the strongest signal for search, and no longer costing anyone their
data), then delete `handoff`, `MovedNotice` and the dev bar entry. The old host keeps redirecting
for ever: its link is in group descriptions and old chats.

`/match` is `noindex` and disallowed in robots: to a crawler it is always an empty screen.

**The home's heading is rendered by the server** (`app/page.tsx`), sr-only as it always was, with a
line of what the app does. Everything else on that page waits for the stores to rehydrate, so the
HTML a crawler received was a spinner and nothing else. It is the same text a screen reader says —
not a second page written for robots. The WhatsApp card (`opengraph-image.tsx`) prints the
address, because the card is how most of the group meets the link.

Vercel's DNS for the domain also carries ImprovMX's MX and SPF records, for mail forwarding at the
domain, and `<Analytics />` (Vercel Web Analytics, cookieless) is in the layout.

## Feedback

**Formspree, not a server.** `FeedbackModal` posts JSON to `NEXT_PUBLIC_FORMSPREE_ENDPOINT`
(`.env.local`, and all three environments in Vercel) and it arrives by email; the free plan's 50 a
month is far more than the group sends. The endpoint is not a secret — the browser posts to it — it
is a variable so it can change without a commit. Unset in production and the whole feature is off.
**On localhost the send is simulated** even with the endpoint set, so working on the dialog does not
fill the inbox.

Two doors, neither of which opens anything by itself:

- **`FeedbackButton`** in the header, right of the wordmark — where Vercel and Linear keep theirs.
  An icon with a Tooltip, on the content column's right edge rather than the viewport's — a
  "Sugerencias" label at the far edge of a laptop was the loudest thing in an otherwise empty bar
  and floated 800px from anything it belonged to. The column differs per route, so it follows the
  pathname. The dialog it opens is titled "Si tuvieras una varita mágica…". A footer
  line was tried first and read as a legal footer with nothing else in it, below Crear equipos
  where nobody scrolls; a floating corner button sits where the thumb rests and over the match
  people photograph.
- **One toast, once ever, after the third share** (`countShareAndShouldNudge`). It waits out the
  share — past the "Copiado" toast's 4s, or the two stack — and its action is outlined, not violet.
  The mark is set when it is shown, so ignoring it counts as an answer.

## The form's layout

**One block across the top, two columns under it, and the kit alone on the right.** Side-by-side
columns were tried three ways first and the measurements are the argument, not taste:

| arrangement | columns | picking Colores |
| --- | --- | --- |
| list beside every control | 384 / 900 | grows |
| list + the blocks that talk about it, beside the rest | 785 / 408 | grows |
| list on top, settings split evenly | 348 / 381 | **grows the page 65px** |
| list on top, kit full width | 256 / 166 | flat, but seven shirts stranded across 900px |
| **list on top, everything but the kit on the left** | **442 / 287** | **flat** |

The last one works because the left column is deliberately the taller one: the space beside the kit
is not a hole, it is the room `Colores` opens into, so changing mode moves nothing on the page. The
list gets the full width because it is the one element that can use it — a long name prints instead
of wrapping — and it keeps its own height (fourteen lines) rather than stretching to whatever the
field stack beside it happens to measure. It used to: 620×901 of box on a laptop for a list that
fills 120×274, which is 94% empty.

`Cupo` and `Precio` share a row. They are the only pair alike enough — both short, both numeric,
both skippable — and it is the one exception the single-column research allows.

## Traps that have already cost time

- **`<Controller defaultValue>` overrides the form's `defaultValues`.** Hit twice: the random toggle
  always opened off, and the kit never restored the last mode used. Do not pass it.
- **`useForm` reads its defaults once, on first render.** `CreateMatchForm` is its own component
  precisely so it mounts after zustand has rehydrated; when it lived in the page it captured an
  empty store and the saved name came back blank every reload.
- **`random` and `prefersRandom` are two different things.** `random` is a fact about *this* match
  — these teams were drawn — and it is what the card claims to the group and what turns dragging
  off. `prefersRandom` is how the group usually plays and is all the form's switch writes. They
  were one field until Mezclar had to set the fact mid-match, at which point one Tuesday's rescue
  started deciding how the next Tuesday's form opened.
- **A deleted row still takes up a slot in `players`.** `isDeleted` hides a row, it does not remove
  it, so the list can grow while the number of people on the pitch does not. Anything that counts
  has to go through `countPlaying`; anything that decides a side has to read `player.team`.
- **A dialog that never unmounts keeps what was typed into it.** `EditModal` resets on open, or
  Cancelar only hides the form and the abandoned values are written by the next Confirmar.
- **`mode: "onTouched"`, not `"onBlur"`** — `onBlur` leaves a field red while you are fixing it.
- **Anything put in an effect's dependency array must be stable.** `useAlert` is memoised; when it
  was not, the "partido ya finalizó" dialog reopened on every render.
- **Mezclar equipos lives on the match screen, and it is the only way out of a 6v4.** Two drop-outs
  on one side leaves a match nothing can even: Sumar jugador asks for people who are not there, and
  dragging is off while the draw is a claim. Dealing again is the one move that fixes the sides
  without breaking the claim — nobody picked them before and nobody picks them now — and the
  history says `se mezclaron los equipos.` out loud, which is what keeps it honest. It marks the
  match as drawn, so a hand-arranged match that gets mixed starts telling the truth about itself.
  It used to sit in Editar, under Confirmar, and nobody looking at the uneven teams found it.
- **The draw flag is not editable, on purpose.** "Sorteo al azar" is a claim made to the group about
  something that already happened. It used to be a switch that could be turned off, which re-enabled
  dragging players between teams — the promise laundered in three taps. Replacing, dropping and
  renaming stay available, because those are facts about who turned up.
- **The dev bar must not ship.** `next.config.mjs` swaps it for a stub via
  `NormalModuleReplacementPlugin` in production; `next/dynamic` was not enough. If you touch its
  import path, re-check the production chunk.

## Verify by looking

`yarn test:e2e` runs the Playwright suite in `e2e/ui.spec.ts` against the dev server (it starts
one if none is listening, and never builds). It covers the form end to end, the switch from the
lever, the words and the keyboard, the kit selector's behaviour and its measured contrasts,
persistence, the row menu, that a drag does not open the menu, the dialogs, Compartir, text at
4.5:1, controls at 3:1, nothing under 12px, no horizontal scroll at 320 and 390, and a clean
console. It used to live in a session scratchpad and was lost with it, which is part of why bugs
got through; keep it in the repo and extend it when you touch the screen.

Beyond the suite, **screenshot the change and read the screenshot** — several of the bugs above
were found that way and would not have been found by reasoning about the CSS. Check 320 / 390 /
768 / 1280, and measure `document.documentElement.scrollWidth` against the viewport to catch
horizontal overflow. Two measurement traps: `getComputedStyle` returns `oklch()`, so normalise
through a 1×1 canvas; and a colour with alpha must be composited over its real ground before it is
read, or a 30% border reports 6:1 where the truth is 1.7:1.

### The WhatsApp message

`parseMessage` in `src/utils/message.ts` is how a pasted list is read, and `generatePlayers` and
`countPlayers` both go through it. **A player is a line that starts with a number.** Read line by
line as names, one real message produced 16 players out of 12: "Partido", "Miércoles", "Cancha" and
"Esta semana" were on the teams. The lines that are not numbered are read for the day and time
("⏳Miércoles 18.30hrs" is the coming Wednesday at 18:30, counted from now) and for the pitch
("🏟️ Cancha: Quintana y Salta"); a paste — the Pegar button or the phone's own menu, caught on the
wrapper because React Aria filters DOM props — fills Lugar and Fecha where they are still empty,
and never from typing. A list with no numbering at all still works the old way, every line a name.
WhatsApp puts U+2060 WORD JOINER between the number and the name (42 in one message); it is neither
whitespace nor a letter, and it is stripped first with the other zero-width characters. The three
real messages the rule was written against are in `message.test.ts`; keep them.

**The empty box's example is six names off the group's own roster, dealt fresh on every load**
(`placeholderList` in `src/utils/placeholder.ts`). Five hardcoded names meant the same five people
were the example forever, which in a group that all reads the same screen looks like the app has
favourites. `ListInput` memoises the call, so the deal happens once per mount and then holds —
a placeholder that reshuffled under the cursor while someone pastes would read as the box doing
something. It is safe to compute at render because `CreateMatchForm` only mounts after the stores
rehydrate, so it never renders on the server and cannot mismatch on hydration.

**The draw is stratified, not free.** `NAMES` is written in the order the names arrived, one
night's list after another, and the deal takes one name out of each equal slice of it. A free
uniform draw measured identical to a real shuffle — it was not biased — but six names out of
thirty-four land in the same third of the list about one day in ten, and the pool is grouped by
night: so one load in ten the example was a photograph of a single Tuesday, which is exactly what
it exists not to be. Slicing makes spanning the roster a guarantee: measured over 120 draws, zero
miss either end, and nobody is left out. **Keep `NAMES` grouped by where each name came from** —
append a new night's list at the end rather than sprinkling it in, or the slices stop meaning
anything.

The form opens with a proposed date: the coming occurrence of the last match's weekday and hour
(`proposeKickoff`). The group plays on a schedule and the date wheel is the slowest field on a
phone. The message's date overrides it; so does the person.

### What the match screen says after the teams exist

- **"Falta uno en Claras"** under the teams when a drop-out leaves the sides uneven, in the same
  voice as the bibs line. Two small numbers in the headers were the only thing saying so, and it is
  the one thing the group has to act on before kick-off.
- **A row that dropped out leaves the list.** It used to stay, struck through, so the group could
  see who was missing; the "falta uno" line and the history ("Fede se dio de baja.") say so now,
  and the struck name only made the team look one longer. The row stays in the data with
  `isDeleted`, so the undo is possible: **Sumar jugador offers whoever left that side first**, by
  the name their row showed, and picking them restores the row ("volvió a sumarse."). Both events
  stay in the history, because both happened. `countPlaying` is the one place that decides who is
  on the pitch (`!isDeleted`); the headers, the lines and the price all use it.
- **`isDeleted` is about the row, whoever it shows.** A substitute who came in (`isReplacedBy`)
  can drop out or be replaced like anyone else: the store names the *drawn* player in the event
  ("Nico se dio de baja", not Mauro) and keeps `isReplacedBy`, so a restore brings Nico back. The
  row menu used to freeze a replaced row — no Dar de baja, no Reemplazar — which after one
  substitution left the organiser with no move at all.
- **Precio de la cancha** is optional and the only numeric field. It is a *text* input with
  `inputMode="numeric"`: a number input drew spinner arrows and reported an empty box as 0. It
  starts empty and has no placeholder, because anything in the box reads as something to fill in.
  `parsePrice` takes unknown: react-hook-form hands the converter `null` before anything is typed,
  and `Number(null)` is 0, which is exactly how the box came to say "0". The card shows
  "$ 2.000 cada uno · $ 24.000 entre 12", recalculated from whoever is playing; it is remembered
  between matches like the pitch and the kit.
- Required fields carry HeroUI's asterisk (`isRequired` on the TextField). With
  `validationBehavior="aria"` that is all it does; react-hook-form still decides what is missing.
- **Cupo de jugadores** is optional and remembered. `splitRoster` cuts the list at it: the first N
  numbered names play, the rest wait, in the order they signed up — and whoever the message lists
  under a "Suplentes" heading waits behind them. The waiting list is `substitutes` in the players
  store, distinct from `bench` (who already came in for someone). The picture prints
  "Suplentes: Nico, Juan", and "Faltan 2 para completar el cupo de 12" when the sides are even and
  still under the cap; when one side is short, "Falta uno en Claras" already says where the hole
  is, so the cap line stays quiet.
- The cap starts at 12 (`DEFAULT_CAPACITY`) and is remembered; cleared, everyone plays. With
  anyone waiting, **Dar de baja asks who comes in** — the substitutes and "Nadie, queda afuera" —
  so the row goes straight from one name to the other and the history writes one event, not a
  drop-out and then a replacement with "falta uno" on screen in between.
- **Sumar jugador** at the foot of the side that is short (both sides when even and under the
  cap), hidden from the picture like every control. "Falta uno en Oscuras" was a statement with no
  way to act on it: an odd list leaves a side short and nothing could add anyone. It opens the same
  "¿Quién entra?" dialog, substitutes first; the new row is spliced where `splitTeams` will hand it
  to that side (the end of the first half for A, the end for B), and the history says "se sumó."
- **Duplicates are numbered by arrival, not by row.** A substitute takes the row of whoever left,
  which may sit above the original, and numbering down the rows made the newcomer "Keis (1)" and
  the Keis who signed up first "Keis (2)". Originals first in list order, then the bench in the
  order people came in.
- **Reemplazar offers the waiting list** as one-tap buttons above the name box; a tap fills the
  box, Confirmar confirms, so a slipped thumb costs nothing. A typed name that is a substitute's is
  the substitute stepping in (`promoteSubstitute`: off the list, onto the bench, into the row) —
  not a second person who happens to share the name. The fixture "Con suplentes" loads fourteen
  for twelve spots.
- The price line reads "$ 2.000 cada uno ($ 24.000)". It said "entre 12", which the chips already
  say, and the total in brackets is enough.

## Still open

- An open question never answered: should "Fede Camino" stop being split into name + surname
  altogether?
- On a narrow phone a replaced player with a long surname still truncates in the on-screen list
  (`Ezequiel (…`). The shared picture no longer does, so this only affects the app itself. Showing
  the surname only when the name is actually duplicated would fix it, but `(Camino)` is wanted
  visible either way, so this needs a decision rather than a patch.
