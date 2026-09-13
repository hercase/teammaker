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
yarn dev
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
- **`--default` paints two things: the switch's off state and the team counter's `Chip`** (soft
  variant, which is `--default` at 50%). Its 51% lightness was chosen for the switch — 3:1 against
  the panel — and the chip rides along; measured, its text sits at 10.45:1. Move the token and check
  both.
- **`--field-background` sits one step above `--surface`, on purpose.** The builder ships them
  identical, which is fine where fields sit on the page and invisible where they sit in a dialog:
  the Editar fields measured 1.00:1 against the dialog body — not dim, gone. Anything that changes
  the surface ramp has to be checked inside a modal, not only on the page.
- Cyan (`secondary`) means *came in*; rose (`error`) means *went out*. Consistent in the team list
  and the history.
- **Buttons are HeroUI's `lg`, and nothing overrides a height.** Its scale is sm 36 / md 40 / lg 44,
  so lg *is* the 44px touch floor. What was here before forced `min-h-12` on top of md: a 48px box
  around 14px text, which reads as a button with too much air rather than a bigger button.
- Touch targets are at least 44px with at least 8px between them. `gap-1` between tappable rows is a
  known anti-pattern here; it was introduced once and reverted. HeroUI's own fields are 40px, so
  every `Input` carries `min-h-11` in its own className — and `w-full`, because its Input sizes to
  its content and the clear button is positioned against the wrapper.

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

**A dark garment on a dark interface cannot be solved with a fill.** Measured against the panel, the
old charcoal reached 1.57:1 and going darker only traded that for 1.06:1 — the shape vanishes either
way. So a preset can carry an `edge`: what to draw when it has to be *seen* rather than shown — the
contour of its icon, and the border of the panel that means "this team wears it". Only `black` has
one, and it is `--color-border-strong`, not a colour of its own. `kitColor` returns the garment;
`kitEdge` returns the line. A black panel border would not be a border.

The three modes are cards, and **each card holds its own settings**, opened inside it when chosen.
They used to sit under all three, which read as a second unrelated question. They carry no heading:
if a card needs a caption to explain its own controls, fix the card.

**The chosen option is lit, its settings are not.** The card's header takes `--segment` — the token
HeroUI paints a selected tab with — and the settings below it stay on `--surface`, with a
`Separator` at `--color-border-strong/60` between them. Measured: option against settings 1.9:1,
separator against settings 3.24:1, chosen against the other cards 2.08:1. Before, the whole card
was one fill with a `--border` hairline across it: that line measured **1.07:1** and selection
**1.24:1**, so the option and its settings were one undivided block and the chosen one barely
differed from the rest. On the lit header the hint loses its dimming, because `--muted` on
`--segment` is 3.56:1 and 12px text needs 4.5.

**HeroUI gives every radio in a vertical group `mt-4`**, on top of any gap you set. The cards sat
24px apart with `gap-2` in the class, and the side buttons floated 16px below their padding. Every
`RadioGroup` here carries `**:data-[slot=radio]:mt-0`, which is how the library's own card demo
removes it. None of these radios has a `Radio.Control`, and the control is the only part HeroUI
draws a focus ring on — so the cards took keyboard focus invisibly until `Radio.Content` got an
inset ring of its own.

The shirts are seven columns sharing the card's width, the team's name above them rather than
beside: six 44px targets with a label to the left did not fit a 390px phone (they were squeezed to
40px and 4px gaps) and at 320px the row overflowed the page by 62px. Seven fill a desktop card at
48px and a 390px phone at **39px wide** — under the 44px this app asks of a target, with the
height holding at 44 — and 29px at 320. That is a known trade, not an oversight.

The chosen mode, the chosen sides and the draw toggle are all remembered as they are picked, not on
submit — `remember()` takes a partial. The group plays the same way every week.

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

## Traps that have already cost time

- **`<Controller defaultValue>` overrides the form's `defaultValues`.** Hit twice: the random toggle
  always opened off, and the kit never restored the last mode used. Do not pass it.
- **`useForm` reads its defaults once, on first render.** `CreateMatchForm` is its own component
  precisely so it mounts after zustand has rehydrated; when it lived in the page it captured an
  empty store and the saved name came back blank every reload.
- **A dialog that never unmounts keeps what was typed into it.** `EditModal` resets on open, or
  Cancelar only hides the form and the abandoned values are written by the next Confirmar.
- **`mode: "onTouched"`, not `"onBlur"`** — `onBlur` leaves a field red while you are fixing it.
- **Anything put in an effect's dependency array must be stable.** `useAlert` is memoised; when it
  was not, the "partido ya finalizó" dialog reopened on every render.
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

## Still open

- **The WhatsApp parser.** Real messages carry metadata lines ("Partido", "Miércoles 20hs", the
  pitch address) that currently become players: one real message produced 16 players instead of 12.
  The rule that validates against all three sample messages is *a player is only a line that starts
  with a number*, and the metadata lines should fill the location and date instead. Also strip
  U+2060 WORD JOINER, which appears 42 times in one real message.
- An open question never answered: should "Fede Camino" stop being split into name + surname
  altogether?
- On a narrow phone a replaced player with a long surname still truncates in the on-screen list
  (`Ezequiel (…`). The shared picture no longer does, so this only affects the app itself. Showing
  the surname only when the name is actually duplicated would fix it, but `(Camino)` is wanted
  visible either way, so this needs a decision rather than a patch.
