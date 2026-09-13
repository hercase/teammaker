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
  someone is already looking at, not one tap away.

## Commands

```bash
yarn dev
yarn run check     # tsc --noEmit && next lint && vitest run — run this before saying anything works
yarn test
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

## Design system

**`src/app/globals.css` is the single source of truth.** Tokens, surface recipes, the type scale and
the z-index scale all live there with the reasoning attached. Read it before writing any styling.

- **Dark only.** No light theme, no `dark:` variant, no theme switcher.
- **Violet is the brand and stays**, but it is for actions, not for everything. An early pass had 23
  `primary` uses against 4 `secondary` and the whole app read as one violet mass. Selection states
  are neutral (`ring-text`), not violet.
- Surfaces go `canvas` → `surface` (panels) → `surface-raised` (rows) → `surface-hover`. In dark
  mode the contrast between two near-black fills is worth almost nothing, so what actually separates
  a panel from the page is **its border and the brightness of its text** — that is where the
  contrast budget is spent.
- Cyan (`secondary`) means *came in*; rose (`error`) means *went out*. Consistent in the team list
  and the history.
- Touch targets are at least 44px with at least 8px between them. `gap-1` between tappable rows is a
  known anti-pattern here; it was introduced once and reverted.

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
| `shirts` | a colour each, from six presets in `src/utils/kit.ts` |
| `bibs` | which of the two teams wears the bibs |

Rules that are enforced and tested: two teams can never wear the same shirt (picking the other
team's colour **swaps** them); in bibs mode only the wearing team is labelled, in one line under the
teams rather than a label in both headers; `parseKit` distrusts persisted JSON and falls back to the
default.

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

`src/hooks/useShareTeams.ts` draws the match to a PNG and hands it to `navigator.share`. What it
photographs is **not** the screen: it is `ShareCard`, a second copy of `MatchSummary` rendered only
while sharing, parked off-screen at `left: -9999px` and a fixed 400px wide. Both of those are
deliberate and were arrived at the hard way:

- **Off-screen**, because the first attempt drew the wordmark into the page itself. On screen the
  logo is already in the sticky header, which is not part of what gets drawn — so the page showed
  two TEAMMAKER titles for as long as the share sheet stayed open.
- **Fixed width**, because otherwise the picture is a photograph of whoever's screen made it: a
  phone produced two narrow columns and a laptop two wide ones, for the same twelve players.

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

There is a Playwright setup in the session scratchpad. **Screenshot the change and read the
screenshot** — several of the bugs above were found that way and would not have been found by
reasoning about the CSS. Check 320 / 390 / 768 / 1280, and measure
`document.documentElement.scrollWidth` against the viewport to catch horizontal overflow.

## Still open

- **The WhatsApp parser.** Real messages carry metadata lines ("Partido", "Miércoles 20hs", the
  pitch address) that currently become players: one real message produced 16 players instead of 12.
  The rule that validates against all three sample messages is *a player is only a line that starts
  with a number*, and the metadata lines should fill the location and date instead. Also strip
  U+2060 WORD JOINER, which appears 42 times in one real message.
- An open question never answered: should "Fede Camino" stop being split into name + surname
  altogether?
- On a narrow phone, a replaced player with a long surname can truncate to `Ezequiel (…`, which says
  nothing. Showing the surname only when the name is actually duplicated would fix it, but the user
  has asked for `(Camino)` to stay visible, so this needs their call.
