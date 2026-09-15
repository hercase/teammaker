import { expect, Page, test } from "@playwright/test";

/*
  The whole of what the app promises the screen, measured rather than eyeballed. Several of the
  bugs this covers were found by a suite like this one living in a session scratchpad, which is
  gone; this is that suite, kept.

  Two measurement traps it is built around:
  - getComputedStyle returns oklch(); everything goes through a 1×1 canvas to become rgb.
  - A colour with alpha is composited over its real ground before it is read. Reading the swatch
    alone reports a 30% border as opaque: 6:1 where the truth is 1.7:1.
*/

const HOME = "/";
const MATCH = "/match";

interface Rgb extends Array<number> {}

interface ColourTools {
  over: (fg: string, bg: string) => Rgb;
  ratio: (a: Rgb, b: Rgb) => number;
  /* The solid colour behind an element: the nearest painted ancestor, composited up to the page. */
  groundOf: (el: Element) => Rgb;
}

declare global {
  interface Window {
    __c: ColourTools;
    __png?: string;
  }
}

const installColourTools = (page: Page) =>
  page.addInitScript(() => {
    const cv = document.createElement("canvas").getContext("2d")!;
    const over = (fg: string, bg: string): Rgb => {
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = bg;
      cv.fillRect(0, 0, 1, 1);
      cv.fillStyle = fg;
      cv.fillRect(0, 0, 1, 1);
      const d = cv.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const lum = (v: Rgb) => {
      const c = v.map((x) => {
        x /= 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a: Rgb, b: Rgb) => {
      const [x, y] = [lum(a), lum(b)];
      return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2);
    };
    const groundOf = (el: Element): Rgb => {
      const layers: string[] = [];
      let n: Element | null = el;
      while (n && n !== document.documentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) layers.push(bg);
        n = n.parentElement;
      }
      layers.push(getComputedStyle(document.body).backgroundColor);
      let ground: Rgb = [0, 0, 0];
      for (const layer of layers.reverse()) ground = over(layer, `rgb(${ground.join(",")})`);
      return ground;
    };
    window.__c = { over, ratio, groundOf };
  });

const rgb = (c: Rgb) => `rgb(${c.join(",")})`;

/* Every test starts from an empty store and ends with a clean console. */
test.beforeEach(async ({ page }) => {
  await installColourTools(page);
  await page.goto(HOME);
  /*
    That this is Teammaker at all. The config reuses whatever already answers on the port, which
    is what makes the suite quick during a session and, on 3000, what once made it measure a
    different Next app end to end: every number came back plausible and wrong, because a 200 is a
    200 and a dark theme is a dark theme. One assertion is cheaper than reading a screenshot to
    find out whose app it is.
  */
  await expect(page).toHaveTitle(/Teammaker/i);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
});

const watchConsole = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`exception: ${e.message.slice(0, 160)}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  return errors;
};

const openFixture = async (page: Page, label: string) => {
  await page.getByRole("button", { name: /barra de desarrollo/i }).click();
  await page.getByText(label, { exact: true }).click();
  await page.waitForURL(`**${MATCH}`);
  await expect(page.locator("li").first()).toBeVisible();
};

const checkedValue = (page: Page, values: string[]) =>
  page.evaluate(
    (vs) =>
      [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(
        (i) => i.checked && vs.includes(i.value)
      )?.value,
    values
  );

/* A player row, as opposed to a line of the history, which is a list too. */
const rows = (page: Page) => page.locator("li", { has: page.getByRole("button", { name: /^Opciones de/ }) });

const MODE_VALUES = ["shades", "shirts", "bibs"];

/*
  The side is a ToggleButtonGroup, so the answer is a <button role="radio"> and not an input: same
  role and same announcement as the RadioGroup it replaced, but nothing to read a `value` off. The
  label is what it is read from.
*/
const checkedSide = (page: Page) =>
  page.evaluate(() =>
    document
      .querySelector('.kit-settings [role="radio"][aria-checked="true"]')
      ?.textContent?.trim()
      .replace(/^Equipo\s+/, "")
  );

/* The garment drawn on each of the two triggers, which is where the chosen shirt is visible. */
const shirtHexes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<SVGPathElement>(".kit-settings .toggle-button svg path[fill]")].map((p) =>
      p.getAttribute("fill")
    )
  );

const fillForm = async (page: Page) => {
  await page.locator("textarea").fill("1. Lucho\n2. Mura\n3. Mauro\n4. Lihue");
  await page.locator("#organizer").fill("Hernán");
  await page.locator("#location").fill("Quintana y Salta");
  const soon = new Date(Date.now() + 3 * 864e5);
  const pad = (n: number) => String(n).padStart(2, "0");
  await page.locator("#date").fill(`${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T20:30`);
};

// ─── formulario ───────────────────────────────────────────────────────────────

test("el formulario: vacío se marca inválido, la X y Pegar escriben en los campos, y completo crea el partido", async ({
  page,
}) => {
  const errors = watchConsole(page);

  await page.getByRole("button", { name: "Crear equipos" }).click();
  await expect(page.locator("textarea")).toHaveAttribute("data-invalid", "true");
  await expect(page.getByText("Pegá la lista para empezar")).toHaveCount(0);
  expect(page.url()).not.toContain(MATCH);

  /* The app writing into a React Aria field from code — the trap that erased everything set by
     setValue until every field was handed `value`. */
  await page.locator("#organizer").pressSequentially("Hernán", { delay: 10 });
  await page.getByRole("button", { name: /Borrar tu nombre/i }).click();
  await expect(page.locator("#organizer")).toHaveValue("");

  await page.evaluate(() => navigator.clipboard.writeText("1. Lucho\n2. Mura\n3. Mauro\n4. Lihue"));
  await page.getByRole("button", { name: "Pegar lista desde el portapapeles" }).click();
  await expect(page.locator("textarea")).toHaveValue(/Lucho/);

  await fillForm(page);
  await page.getByRole("button", { name: "Crear equipos" }).click();
  await page.waitForURL(`**${MATCH}`);
  await expect(rows(page)).toHaveCount(4);
  await expect(page.getByText("Quintana y Salta")).toBeVisible();

  expect(errors).toEqual([]);
});

// ─── switch ───────────────────────────────────────────────────────────────────

test("el switch responde desde la palanca, desde el texto y con teclado", async ({ page }) => {
  const errors = watchConsole(page);
  const state = () => page.evaluate(() => document.querySelector<HTMLInputElement>('[role="switch"]')?.checked);

  await expect(page.getByRole("switch")).toHaveCount(1);
  expect(await state()).toBe(false);

  /* The lever itself, not the words: with Switch.Control as a sibling of Switch.Content it was
     decoration, and only the words toggled anything. */
  await page.locator(".switch__control").click();
  expect(await state()).toBe(true);
  await page.locator(".switch__control").click();
  expect(await state()).toBe(false);

  await page.getByText("Orden aleatorio").click();
  expect(await state()).toBe(true);

  await page.evaluate(() => document.querySelector<HTMLInputElement>('[role="switch"]')?.focus());
  await page.keyboard.press("Space");
  expect(await state()).toBe(false);

  expect(errors).toEqual([]);
});

// ─── selector de kit ──────────────────────────────────────────────────────────

test("el selector de kit: cambia de modo, elige el lado, nunca repite camiseta y muestra el foco", async ({ page }) => {
  const errors = watchConsole(page);

  expect(await checkedValue(page, MODE_VALUES)).toBe("shades");

  await page.getByText("Pecheras", { exact: true }).click();
  expect(await checkedValue(page, MODE_VALUES)).toBe("bibs");
  await page.getByRole("radio", { name: "Equipo B" }).click();
  expect(await checkedSide(page)).toBe("B");

  /* Picking the other team's colour swaps them; two teams never wear the same shirt. */
  await page.getByText("Colores", { exact: true }).click();
  expect(await checkedValue(page, MODE_VALUES)).toBe("shirts");

  const [aBefore, bBefore] = await shirtHexes(page);
  expect(aBefore).not.toBe(bBefore);

  /*
    The seven swatches sharing the card are gone: each side opens a ColorPicker, so the preset is
    picked inside the popover and the trigger is what shows the result.
  */
  await page.getByRole("button", { name: "Camiseta del equipo A" }).click();
  /* HeroUI's ColorSwatchPicker is a listbox of options, not a radio group. */
  const swatches = page.getByRole("listbox", { name: "Color swatches" });
  await expect(swatches).toBeVisible();
  /* A wears white and B blue to start with, and the swatch row says so. */
  await expect(swatches.getByRole("option", { name: "Blanca" })).toHaveAttribute("aria-selected", "true");

  /* Handing A the colour B is already wearing has to move B, not leave them identical. */
  await swatches.getByRole("option", { name: "Azul" }).click();
  await page.keyboard.press("Escape");
  await expect(swatches).toBeHidden();

  const [aAfter, bAfter] = await shirtHexes(page);
  expect(aAfter).toBe(bBefore);
  expect(bAfter).toBe(aBefore);
  expect(aAfter).not.toBe(bAfter);

  /* No Radio.Control anywhere in here, so HeroUI draws no focus ring of its own: the cards used
     to take keyboard focus with nothing on screen saying so. */
  await page.evaluate(() => document.querySelector<HTMLInputElement>(".radio-group input[type=radio]")?.focus());
  await page.keyboard.press("ArrowDown");
  const ring = await page.evaluate(() => {
    const content = document.activeElement?.closest(".radio")?.querySelector(".radio__content");
    if (!content) return null;
    const shadow = getComputedStyle(content).boxShadow;
    return {
      focusVisible: content.getAttribute("data-focus-visible"),
      painted: /rgba?\((?!0, 0, 0, 0\))/.test(shadow),
    };
  });
  expect(ring).toEqual({ focusVisible: "true", painted: true });

  /*
    And the two sides, which are toggle buttons rather than radios and are marked with an outline
    rather than a ring. Both halves of that are load-bearing: inside a `.toggle-button` the ring
    resolves in --tw-ring-shadow and never reaches box-shadow, and `outline-2` alone leaves the
    style at the `none` HeroUI set. So this asserts the painted outline, not the attribute.
  */
  await page.getByText("Pecheras", { exact: true }).click();
  await page.getByRole("radio", { name: "Equipo A" }).focus();
  await page.keyboard.press("ArrowRight");
  const sideRing = await page.evaluate(() => {
    const half = document.activeElement as HTMLElement | null;
    if (!half?.classList.contains("toggle-button")) return null;
    const cs = getComputedStyle(half);
    return {
      label: half.textContent?.trim(),
      focusVisible: half.getAttribute("data-focus-visible"),
      outline: `${cs.outlineStyle} ${cs.outlineWidth}`,
    };
  });
  expect(sideRing).toEqual({ label: "Equipo B", focusVisible: "true", outline: "solid 2px" });
  /*
    And here the component is not quite the radio group it announces itself as: the arrow moved
    focus without choosing, so the side is still A. A real RadioGroup checks as it moves, which is
    what the ARIA pattern asks of role="radio"; React Aria gives ToggleButtonGroup toolbar-style
    keys and radio roles. Space is what picks. Asserted as it actually behaves rather than as it
    ought to, so that a library fix shows up here as a failure instead of passing unnoticed.
  */
  expect(await checkedSide(page)).toBe("A");
  await page.keyboard.press("Space");
  expect(await checkedSide(page)).toBe("B");

  expect(errors).toEqual([]);
});

test("el selector de kit: la opción se distingue de sus ajustes y de las otras, y nada se aprieta", async ({
  page,
}) => {
  await page.getByText("Colores", { exact: true }).click();
  await page.mouse.move(0, 0); // hover paints the card under the pointer
  await page.waitForTimeout(400); // and the fills are mid-transition for 150ms after a click

  const m = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const rgb = (c: number[]) => `rgb(${c.join(",")})`;

    /* The three mode cards. The settings row is a sibling of the group now, not inside the chosen
       card, so the chosen one is the one whose input is checked. */
    const cards = [...document.querySelectorAll<HTMLElement>(".radio-group > .radio")].filter((c) =>
      ["shades", "shirts", "bibs"].includes(c.querySelector<HTMLInputElement>("input[type=radio]")?.value ?? "")
    );
    const chosen = cards.find((c) => c.querySelector<HTMLInputElement>("input[type=radio]")?.checked)!;
    const other = cards.find((c) => !c.querySelector<HTMLInputElement>("input[type=radio]")?.checked)!;
    const head = chosen.querySelector<HTMLElement>(".radio__content")!;
    const settings = document.querySelector<HTMLElement>(".kit-settings")!;
    /* The one label saying what the two buttons under it are for. */
    const question = settings.querySelector<HTMLElement>("span")!;

    const settingsGround = groundOf(settings);
    const headGround = groundOf(head);
    const otherGround = groundOf(other);

    const cardRects = cards.map((c) => c.getBoundingClientRect());

    /* One segmented control, so its edge is the boundary that has to be visible — not each half's. */
    const group = settings.querySelector<HTMLElement>(".toggle-button-group")!;
    const halves = [...group.querySelectorAll<HTMLElement>(".toggle-button")];

    return {
      optionVsSettings: ratio(headGround, settingsGround),
      chosenVsOther: ratio(headGround, otherGround),
      chosenLabel: ratio(over(getComputedStyle(head).color, rgb(headGround)), headGround),
      questionOnSettings: ratio(over(getComputedStyle(question).color, rgb(settingsGround)), settingsGround),
      questionSize: parseFloat(getComputedStyle(question).fontSize),
      gapsBetweenCards: cardRects.slice(1).map((r, i) => Math.round(r.top - cardRects[i].bottom)),
      /*
        The edge is on ::after, above the options, so a hover fill cannot cover it. An outline on
        the parent disappeared the moment the pointer sat on a half.
      */
      trackBorder: ratio(
        over(getComputedStyle(group, "::after").borderTopColor, rgb(settingsGround)),
        settingsGround
      ),
      panelBorder: ratio(over(getComputedStyle(settings).borderTopColor, rgb(settingsGround)), settingsGround),
      halfCount: halves.length,
      halfHeights: [...new Set(halves.map((h) => Math.round(h.getBoundingClientRect().height)))],
      /*
        The pair's own box, and not only its halves. With a border it came to 46 around a 44px row
        while a mode row stayed at 44, because the mode track shares those same 2px out between
        three rows — and 2px on a 44px object is exactly what "one of these is taller" looks like.
      */
      pairTrack: Math.round(group.getBoundingClientRect().height),
      minHalfWidth: Math.min(...halves.map((h) => Math.round(h.getBoundingClientRect().width))),
      /* Every label on whatever that half is actually filled with. */
      labels: halves.map((h) => {
        const ground = groundOf(h);
        return ratio(over(getComputedStyle(h).color, rgb(ground)), ground);
      }),
      /* The garment must survive HeroUI's `svg { size-5; sm:size-4 }` inside a toggle button. */
      iconSizes: [...new Set(halves.map((h) => Math.round(h.querySelector("svg")!.getBoundingClientRect().width)))],
      /* A mode row is something you press, so it is 44 like everything else. It was 48. */
      modeRowHeights: [
        ...new Set(cards.map((c) => Math.round(c.querySelector(".radio__content")!.getBoundingClientRect().height))),
      ],
      /* One garment size on the card, not 26 in the rows and 28 in the buttons under them. */
      garmentSizes: [
        ...new Set(
          [...settings.parentElement!.querySelectorAll("svg")]
            .map((s) => Math.round(s.getBoundingClientRect().width))
            /* The caret is not a garment; it says the shirt buttons open rather than choose. */
            .filter((w) => w > 20)
        ),
      ],
      /*
        A half is drawn like the mode row above it — same height, same radius, same type — so the
        pair reads as the answer to those rows and not as a control of its own. Asserted as one
        shape rather than three numbers, because all three came from HeroUI's `lg` and all three
        differed: a 16px label in a rounded-3xl pill, 40px tall above 768.
      */
      rowShape: [
        head.getBoundingClientRect().height,
        /* The radius that shows is the track's in both controls; a row and a half are square. */
        getComputedStyle(chosen.parentElement!).borderTopLeftRadius,
        getComputedStyle(head).fontSize,
      ].join(" "),
      halfShapes: [
        ...new Set(
          halves.map((half) => {
            const cs = getComputedStyle(half);
            /* The radius that shows is the track's; the half's own corners are squared into it. */
            return [half.getBoundingClientRect().height, getComputedStyle(group).borderTopLeftRadius, cs.fontSize].join(
              " "
            );
          })
        ),
      ],
      squareHalves: [...new Set(halves.map((half) => getComputedStyle(half).borderTopLeftRadius))],
      /* The two panels the form stacks: their text has to start at the same place. */
      panelInsets: [
        ...new Set(
          [settings, document.querySelector<HTMLElement>(".switch")!].map((p) => getComputedStyle(p).paddingLeft)
        ),
      ],
    };
  });

  /*
    Selected is --segment: a lighter fill, not a 12% violet wash. --accent-soft sat next to
    Crear equipos and read as a second primary. A ~1.8 fill is this lift; the label going
    white at font-medium is the other half of the signal.
  */
  expect(m.optionVsSettings).toBeGreaterThan(1.4);
  expect(m.optionVsSettings).toBeLessThan(2.3);
  expect(m.chosenVsOther).toBeGreaterThan(1.4);
  expect(m.chosenVsOther).toBeLessThan(2.3);
  expect(m.chosenLabel).toBeGreaterThanOrEqual(4.5);
  expect(m.questionOnSettings).toBeGreaterThanOrEqual(4.5);
  expect(m.questionSize).toBeGreaterThanOrEqual(12);
  /*
    Attached, and that is the whole reason the two controls stopped reading as different
    components: three boxes 8px apart say "three objects" where the pair below says "one object
    with two parts", for the same question asked twice. It also takes HeroUI's mt-4 off the rows.
  */
  expect(m.gapsBetweenCards).toEqual([0, 0]);
  /* Same --border as the panel it sits with, not the outline button's border-strong/60. */
  expect(m.trackBorder).toBeCloseTo(m.panelBorder, 1);
  /*
    Two halves, and no gap between them on purpose: they are one control, which is why the 8px this
    app asks between tappable rows does not apply here. Seven shirts sharing the card used to come
    out 39px wide; half a 320px row is 130.
  */
  expect(m.halfCount).toBe(2);
  expect(m.halfHeights).toHaveLength(1);
  expect(m.halfHeights[0]).toBeGreaterThanOrEqual(80);
  expect(m.pairTrack).toBe(m.halfHeights[0]);
  expect(m.minHalfWidth).toBeGreaterThanOrEqual(120);
  m.labels.forEach((l) => expect(l).toBeGreaterThanOrEqual(4.5));
  expect(m.iconSizes).toEqual([32]);
  expect(m.modeRowHeights).toEqual([44]);
  /* Modes stay 28; the A/B tiles are a step bigger. */
  expect([...m.garmentSizes].sort((a, b) => a - b)).toEqual([28, 32]);
  expect(m.squareHalves).toEqual(["0px"]);
  /* One panel recipe: this card wrote its own and landed 4px in from the switch below it. */
  expect(m.panelInsets).toEqual(["16px"]);

  /*
    Pecheras is the mode that used to look broken: one half drew a bib, the other drew nothing,
    and "Equipo A" floated in the middle of its tile. Both labels have to sit on the same line,
    and the empty half has to show a shirt outline — not a hollow bib, and not nothing.
  */
  await page.getByText("Pecheras", { exact: true }).click();
  await page.waitForTimeout(400);
  const bibs = await page.evaluate(() => {
    const halves = [...document.querySelectorAll<HTMLElement>(".kit-settings .toggle-button")];
    const labelTop = (half: HTMLElement) => {
      const label = [...half.querySelectorAll("span")].find((s) => s.textContent?.trim().startsWith("Equipo"));
      return Math.round(label!.getBoundingClientRect().top);
    };
    return {
      tops: halves.map(labelTop),
      svgs: halves.map((h) => h.querySelectorAll("svg").length),
      fills: halves.map((h) => h.querySelector("path")?.getAttribute("fill")),
    };
  });
  expect(bibs.svgs).toEqual([1, 1]);
  expect(bibs.tops[0]).toBe(bibs.tops[1]);
  /* Default bibs: Equipo A wears them (orange fill), B is the shirt contour (no fill). */
  expect(bibs.fills).toEqual(["#f97316", "none"]);
});

test("el selector de kit en Colores no desborda un teléfono de 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  /* The form is two columns on a laptop and one here, and the reflow is not synchronous: measured
     straight after the resize, the textarea still reported its desktop width and the page looked
     348px wide when it is 320. */
  await page.waitForTimeout(200);
  await page.getByText("Colores", { exact: true }).click();
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const halves = [...document.querySelectorAll<HTMLElement>(".kit-settings .toggle-button")].map((t) =>
      t.getBoundingClientRect()
    );
    return {
      scrollWidth: document.documentElement.scrollWidth,
      count: halves.length,
      heights: [...new Set(halves.map((r) => Math.round(r.height)))],
      minWidth: Math.min(...halves.map((r) => Math.round(r.width))),
    };
  });
  /* It overflowed to 382px when seven shirts shared the card. Two halves have room to spare. */
  expect(m.scrollWidth).toBe(320);
  expect(m.count).toBe(2);
  expect(m.heights).toHaveLength(1);
  expect(m.heights[0]).toBeGreaterThanOrEqual(72);
  expect(m.minWidth).toBeGreaterThanOrEqual(44);
});

test("en un laptop la lista va arriba a todo el ancho y Pegar queda dentro", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const list = document.querySelector("textarea")!;
    const form = document.querySelector("form")!;
    const paste = document.querySelector<HTMLElement>('button[aria-label^="Pegar"]')!;
    const kit = document.querySelector<HTMLElement>(".radio-group")!;
    const listBox = list.getBoundingClientRect();
    const pasteBox = paste.getBoundingClientRect();
    const formBox = form.getBoundingClientRect();
    const kitBox = kit.getBoundingClientRect();
    return {
      listH: Math.round(listBox.height),
      listW: Math.round(listBox.width),
      formW: Math.round(formBox.width),
      formH: Math.round(formBox.height),
      kitTop: Math.round(kitBox.top),
      listBottom: Math.round(listBox.bottom),
      kitLeft: Math.round(kitBox.left),
      formMid: Math.round(formBox.left + formBox.width / 2),
      pasteInside:
        pasteBox.left >= listBox.left &&
        pasteBox.right <= listBox.right + 1 &&
        pasteBox.top >= listBox.top &&
        pasteBox.bottom <= listBox.bottom + 1,
    };
  });
  /* Fourteen lines (min-h-84 is 336), across the form, not a stub in one column. */
  expect(m.listH).toBeGreaterThanOrEqual(320);
  expect(m.listH).toBeLessThan(400);
  expect(m.listW).toBeGreaterThan(m.formW * 0.9);
  expect(m.formH - m.listH).toBeGreaterThan(120);
  expect(m.kitTop).toBeGreaterThan(m.listBottom);
  expect(m.kitLeft).toBeGreaterThan(m.formMid);
  expect(m.pasteInside).toBe(true);

  /* The Equipo A/B pair is still HeroUI's ToggleButtonGroup; from md it is a tile, not a 44px bar. */
  const sides = await page.evaluate(() => {
    const halves = [...document.querySelectorAll<HTMLElement>(".kit-settings .toggle-button")];
    return {
      heights: [...new Set(halves.map((h) => Math.round(h.getBoundingClientRect().height)))],
      garments: [
        ...new Set(
          halves
            .map((h) => h.querySelector("svg"))
            .filter(Boolean)
            .map((s) => Math.round(s!.getBoundingClientRect().width))
        ),
      ],
    };
  });
  expect(sides.heights.length).toBe(1);
  expect(sides.heights[0]).toBeGreaterThanOrEqual(88);
  expect(sides.garments).toEqual([40]);
});

// ─── persistencia ─────────────────────────────────────────────────────────────

test("el kit, el lado y el nombre persisten sin crear nada", async ({ page }) => {
  const errors = watchConsole(page);
  await page.getByText("Pecheras", { exact: true }).click();
  await page.getByRole("radio", { name: "Equipo B" }).click();
  await page.locator("#organizer").fill("Hernán");
  await page.waitForTimeout(400);

  await page.reload({ waitUntil: "networkidle" });
  expect(await checkedValue(page, MODE_VALUES)).toBe("bibs");
  expect(await checkedSide(page)).toBe("B");
  await expect(page.locator("#organizer")).toHaveValue("Hernán");
  expect(errors).toEqual([]);
});

// ─── partido ──────────────────────────────────────────────────────────────────

test("el menú de fila: abre desde el ⋮, renombra, se cierra con Escape y no se abre al arrastrar", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con un cambio y una baja");
  /* Twelve signed up, one dropped out: eleven rows, and the one who left is in the history. */
  await expect(rows(page)).toHaveCount(11);

  await page
    .getByRole("button", { name: /^Opciones de/ })
    .first()
    .click();
  await expect(page.getByRole("menuitem")).toHaveCount(3);
  await page.getByRole("menuitem", { name: "Renombrar" }).click();
  const input = page.locator('[data-testid="dialog-input"]');
  await expect(input).toBeVisible();
  await input.fill("Ramiro");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Ramiro").first()).toBeVisible();

  await page
    .getByRole("button", { name: /^Opciones de/ })
    .first()
    .click();
  await expect(page.getByRole("menuitem")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem")).toHaveCount(0);

  /* React Aria reads the end of a drag as a press, so when the row was also the trigger every
     move opened the menu. The menu hangs off the ⋮ now; dragging the row must open nothing. */
  const from = (await rows(page).nth(0).boundingBox())!;
  const to = (await rows(page).nth(3).boundingBox())!;
  await page.mouse.move(from.x + 40, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 40, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  await expect(page.getByRole("menuitem")).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("los diálogos: Dar de baja pide confirmación, y Editar abre con los datos y Cancelar los deja", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con un cambio y una baja");

  await page
    .getByRole("button", { name: /^Opciones de/ })
    .first()
    .click();
  await page.getByRole("menuitem", { name: "Dar de baja" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Editar" }).click();
  await expect(page.locator("#location")).toBeVisible();
  const before = {
    organizer: await page.locator("#organizer").inputValue(),
    location: await page.locator("#location").inputValue(),
    date: await page.locator("#date").inputValue(),
  };
  expect(before.organizer).not.toBe("");
  expect(before.location).not.toBe("");
  expect(before.date).not.toBe("");
  /* Blur → validation → re-render: the values must survive it (the `value` not `defaultValue` trap). */
  await page.locator("#organizer").click();
  await page.locator("#location").click();
  await expect(page.locator("#location")).toHaveValue(before.location);

  await page.locator("#location").fill("Otro lado");
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.locator("#location")).toHaveCount(0);
  await expect(page.getByText(before.location)).toBeVisible();
  await expect(page.getByText("Otro lado")).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("Compartir produce una sola imagen PNG", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con un cambio y una baja");
  await page.evaluate(() => {
    window.__png = undefined;
    navigator.clipboard.write = async (items) => {
      const blob = await items[0].getType("image/png");
      window.__png = `${items[0].types.join(",")}:${blob.size}`;
    };
  });
  await page.getByRole("button", { name: "Compartir" }).click();
  await page.waitForFunction(() => Boolean(window.__png), null, { timeout: 20_000 });
  const result = (await page.evaluate(() => window.__png))!;
  const [types, size] = result.split(":");
  expect(types).toBe("image/png");
  expect(Number(size)).toBeGreaterThan(20_000);
  expect(errors).toEqual([]);
});

// ─── la tira de botones del partido ───────────────────────────────────────────

test("los botones del partido son tres pesos distintos, y Mezclar reparte de nuevo", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con un cambio y una baja");
  await page.mouse.move(0, 0);

  /*
    Compartir is the filled action; Mezclar and the pair are outline. Compartir and Mezclar came out identical
    once — same violet, same everything — because the wrapper had no "tertiary" in its map and an
    unmapped name falls through to HeroUI's default, which is primary. Nothing threw; the screen
    just quietly had two main actions.
  */
  const strip = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const find = (label: string) =>
      [...document.querySelectorAll<HTMLElement>("button")].find((b) => b.textContent?.trim() === label)!;

    return ["Compartir", "Mezclar equipos", "Nueva lista", "Editar"].map((label) => {
      const el = find(label);
      const cs = getComputedStyle(el);
      const ground = groundOf(el.parentElement!);
      const fill = over(cs.backgroundColor, `rgb(${ground.join(",")})`);
      return {
        label,
        height: Math.round(el.getBoundingClientRect().height),
        fill: ratio(fill, ground),
        text: ratio(over(cs.color, `rgb(${fill.join(",")})`), fill),
        border: ratio(over(cs.borderTopColor, `rgb(${ground.join(",")})`), ground),
        borderWidth: parseFloat(cs.borderTopWidth),
      };
    });
  });

  const [share, mix, fresh, edit] = strip;

  /* Every one of them is a thumb target, and lg is 44px exactly — nothing overrides a height. */
  for (const b of strip) expect(b.height, b.label).toBe(44);

  /* Readable labels. Compartir is the filled action; Mezclar and the pair are outline — a
     visible edge, no fill — so Mezclar does not read as disabled and does not disappear. */
  for (const b of strip) expect(b.text, `${b.label} label`).toBeGreaterThanOrEqual(4.5);
  expect(share.fill).toBeGreaterThanOrEqual(3);
  expect(mix.fill).toBeLessThan(1.2);
  expect(mix.border).toBeGreaterThanOrEqual(3);
  expect(mix.borderWidth).toBeGreaterThan(0);
  for (const b of [fresh, edit]) {
    expect(b.fill, `${b.label} fill`).toBeLessThan(1.2);
    expect(b.border, `${b.label} edge`).toBeGreaterThanOrEqual(3);
    expect(b.borderWidth, `${b.label} edge`).toBeGreaterThan(0);
  }

  /* And they are actually different from each other, which is the part that regressed. */
  expect(share.fill - mix.fill).toBeGreaterThan(0.2);

  /* The two halves share one edge and one divider, which is the whole reason for ButtonGroup. */
  const group = await page.evaluate(() => {
    const g = document.querySelector<HTMLElement>(".button-group")!;
    const widths = [...g.children].map((c) => Math.round(c.getBoundingClientRect().width));
    return {
      full: Math.round(g.getBoundingClientRect().width),
      widths,
      separators: g.querySelectorAll(".button-group__separator").length,
    };
  });
  expect(group.widths).toHaveLength(2);
  expect(group.widths[0]).toBe(group.widths[1]);
  expect(group.widths[0] + group.widths[1]).toBe(group.full);
  expect(group.separators).toBe(1);

  /*
    Mezclar lives here rather than in Editar, and it has to deal a genuinely different partition:
    writing only `.team` onto the signup order left everyone where they were, so three mixes in a
    row read as a no-op while the history said otherwise.
  */
  const sides = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("ul")]
        .slice(0, 2)
        .map((ul) => [...ul.querySelectorAll("li")].map((li) => li.textContent?.trim()).sort().join(","))
        .join("|")
    );

  const seen = new Set<string>();
  seen.add(await sides());
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Mezclar equipos" }).click();
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    seen.add(await sides());
  }
  expect(seen.size, "tres mezclas tienen que dar particiones distintas").toBeGreaterThanOrEqual(3);

  /* Mixing is a claim, so it turns dragging off and says so in the history. */
  await expect(page.getByText(/se mezclaron los equipos/i).first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("el objetivo de drop se dibuja punteado y violeta, no transparente", async ({ page }) => {
  await openFixture(page, "Con un cambio y una baja");

  /*
    The name block is what moves, so the outline has to wrap the block: flex-1 for the width the
    row leaves beside the ⋮, padding rather than margin so the border grows around the name
    instead of pushing its neighbours, and a permanent 2px so nothing shifts when it lights up.
  */
  const idle = await page.evaluate(() => {
    const li = document.querySelector("li")!;
    const p = li.querySelector("p")!;
    const cs = getComputedStyle(p);
    return {
      grows: cs.flexGrow,
      padding: parseFloat(cs.paddingLeft),
      margin: parseFloat(cs.marginLeft),
      borderWidth: parseFloat(cs.borderTopWidth),
      fillsRow: Math.round(p.getBoundingClientRect().right) <= Math.round(li.getBoundingClientRect().right),
    };
  });
  expect(idle.grows).toBe("1");
  expect(idle.padding).toBeGreaterThan(0);
  expect(idle.margin).toBe(0);
  expect(idle.borderWidth).toBe(2);
  expect(idle.fillsRow).toBe(true);

  /*
    And the colour survives. react-dnd's HTML5 backend needs a real drag to set isOver, which
    synthetic mouse events cannot produce, so what is measured here is the thing that actually
    broke: border-transparent and border-primary-400 set the same property, so layering them left
    a dashed border painted in nothing — and swapping their order in the className changes
    nothing, because what decides is the order Tailwind emits them in. The branches are exclusive
    now, and this is what would catch them being merged back.
  */
  const painted = await page.evaluate(() => {
    const host = document.querySelector("li")!;
    const base = "border-2 rounded-md px-1.5";
    const read = (extra: string) => {
      const el = document.createElement("p");
      el.className = `${base} ${extra}`;
      host.appendChild(el);
      const cs = getComputedStyle(el);
      const out = { style: cs.borderTopStyle, colour: cs.borderTopColor };
      el.remove();
      return out;
    };
    return {
      layered: read("border-transparent border-dashed border-primary-400"),
      switched: read("border-dashed border-primary-400"),
      resting: read("border-solid border-transparent"),
    };
  });

  expect(painted.layered.colour, "layering the two is the bug this replaced").toBe("rgba(0, 0, 0, 0)");
  expect(painted.switched.style).toBe("dashed");
  expect(painted.switched.colour).not.toBe("rgba(0, 0, 0, 0)");
  expect(painted.resting.colour).toBe("rgba(0, 0, 0, 0)");
});

// ─── calidad: texto, tamaños, desborde ────────────────────────────────────────

for (const [label, prepare] of [
  ["la home", async () => undefined],
  ["el partido", (page: Page) => openFixture(page, "Con un cambio y una baja")],
] as const) {
  test(`${label}: texto a 4.5:1, nada bajo 12px, sin scroll horizontal a 320 y 390`, async ({ page }) => {
    const errors = watchConsole(page);
    await prepare(page);
    await page.mouse.move(0, 0);

    const text = await page.evaluate(() => {
      const { over, ratio, groundOf } = window.__c;
      const out: { t: string; r: number; size: number }[] = [];
      document.querySelectorAll<HTMLElement>("p,span,h1,h2,h3,label,button,a,li,td").forEach((el) => {
        if (!el.textContent?.trim() || el.offsetParent === null) return;
        if ([...el.children].some((c) => c.textContent?.trim() === el.textContent?.trim())) return;
        const cs = getComputedStyle(el);
        const ground = groundOf(el);
        const size = parseFloat(cs.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        const r = ratio(over(cs.color, `rgb(${ground.join(",")})`), ground);
        if (r < (large ? 3 : 4.5) || size < 12) out.push({ t: el.textContent!.trim().slice(0, 30), r, size });
      });
      return out;
    });
    expect(text, JSON.stringify(text)).toEqual([]);

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${width}px`).toBeLessThanOrEqual(width);
    }
    expect(errors).toEqual([]);
  });
}

// ─── calidad: contraste de controles (WCAG 1.4.11) ───────────────────────────

test("los controles se ven: toggle apagado, borde del botón outline, opciones del kit y contador", async ({ page }) => {
  /* A different rule from text contrast. Both of these shipped invisible once: the unset switch at
     1.20:1 and the outline button's edge at 1.07:1. */
  await page.mouse.move(0, 0);
  const home = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const track = document.querySelector<HTMLElement>(".switch__control")!;
    const thumb = document.querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;
    const paste = document.querySelector<HTMLElement>('button[aria-label^="Pegar"]')!;
    const g = (el: Element) => groundOf(el.parentElement!);
    const trackFill = over(getComputedStyle(track).backgroundColor, `rgb(${g(track).join(",")})`);
    return {
      track: ratio(trackFill, g(track)),
      thumb: ratio(over(getComputedStyle(thumb).backgroundColor, `rgb(${trackFill.join(",")})`), trackFill),
      outline: ratio(over(getComputedStyle(paste).borderColor, `rgb(${g(paste).join(",")})`), g(paste)),
    };
  });
  expect(home.track).toBeGreaterThanOrEqual(3);
  expect(home.outline).toBeGreaterThanOrEqual(3);

  /*
    Off is turquoise too — a darker step of the same cyan, not the neutral grey it used to be — so
    the thumb has to clear its track in this state as well, and not only against the card.
  */
  expect(home.thumb).toBeGreaterThanOrEqual(3);

  /*
    And the on state, which is a second colour and therefore a second measurement. Both come
    through the tokens the library declares for them, --switch-control-bg and its -checked, and the
    thumb carries the arrows the match card puts on "Sorteo al azar". Only two steps of the ramp
    keep the track visible against the card *and* the thumb visible against the track, so these are
    the two numbers there are to hit. The pointer is moved away first: hovering swaps in
    --switch-control-bg-checked-hover, which is a step brighter and a different number.
  */
  await page.locator(".switch__control").click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  const on = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const track = document.querySelector<HTMLElement>(".switch__control")!;
    const thumb = document.querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;
    const icon = document.querySelector<HTMLElement>('[data-slot="switch-icon"]');
    const ground = groundOf(track.parentElement!);
    const trackFill = over(getComputedStyle(track).backgroundColor, `rgb(${ground.join(",")})`);
    const thumbFill = over(getComputedStyle(thumb).backgroundColor, `rgb(${trackFill.join(",")})`);
    return {
      hasIcon: Boolean(icon),
      track: ratio(trackFill, ground),
      thumb: ratio(thumbFill, trackFill),
      icon: icon ? ratio(over(getComputedStyle(icon).color, `rgb(${thumbFill.join(",")})`), thumbFill) : 0,
    };
  });
  expect(on.hasIcon, "el switch encendido lleva su ícono").toBe(true);
  expect(on.track).toBeGreaterThanOrEqual(3);
  expect(on.thumb).toBeGreaterThanOrEqual(3);
  expect(on.icon).toBeGreaterThanOrEqual(3);
  await page.locator(".switch__control").click();

  await page.getByText("Pecheras", { exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  const side = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    /*
      The two sides are one segmented control, so the edge that has to clear 3:1 is the track's,
      around the pair. The chosen half is --segment, the same lift as the mode row above.
    */
    const group = document.querySelector<HTMLElement>(".kit-settings .toggle-button-group")!;
    const chosen = group.querySelector<HTMLElement>('.toggle-button[aria-checked="true"]')!;
    const ground = groundOf(group.parentElement!);
    const fill = over(getComputedStyle(chosen).backgroundColor, `rgb(${ground.join(",")})`);
    return {
      /* On ::after, above the options, so a hover fill cannot cover it — see SEGMENT_TRACK. */
      trackBorder: ratio(
        over(getComputedStyle(group, "::after").borderTopColor, `rgb(${ground.join(",")})`),
        ground
      ),
      panelBorder: ratio(
        over(getComputedStyle(group.parentElement!).borderTopColor, `rgb(${ground.join(",")})`),
        ground
      ),
      chosenFill: ratio(fill, ground),
      chosenLabel: ratio(over(getComputedStyle(chosen).color, `rgb(${fill.join(",")})`), fill),
    };
  });
  expect(side.trackBorder).toBeCloseTo(side.panelBorder, 1);
  expect(side.chosenFill).toBeGreaterThan(1.4);
  expect(side.chosenFill).toBeLessThan(2.3);
  expect(side.chosenLabel).toBeGreaterThanOrEqual(4.5);

  await openFixture(page, "Con un cambio y una baja");
  const chip = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const chip = document.querySelector<HTMLElement>(".chip")!;
    const label = chip.querySelector<HTMLElement>(".chip__label")!;
    const fill = groundOf(chip);
    return {
      text: ratio(over(getComputedStyle(label).color, `rgb(${fill.join(",")})`), fill),
      size: parseFloat(getComputedStyle(label).fontSize),
    };
  });
  expect(chip.text).toBeGreaterThanOrEqual(4.5);
  expect(chip.size).toBeGreaterThanOrEqual(12);
});

test("el card del partido lleva el tinte violeta y su texto sigue legible sobre él", async ({ page }) => {
  await openFixture(page, "Con un cambio y una baja");
  const m = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const card = document.querySelector<HTMLElement>('[data-slot="card"]')!;
    const title = card.querySelector<HTMLElement>('[data-slot="card-title"]')!;
    const muted = [...card.querySelectorAll<HTMLElement>('[data-slot="card-description"]')].pop()!;
    /* The corner is where the tint is strongest: the gradient's first stop, at full, over the card.
       Computed, color-mix() has already become an oklab() with alpha; the first colour function in
       the string is that stop. */
    const tint = getComputedStyle(card).backgroundImage.match(/\b(?:oklab|oklch|rgba?|hsla?|color)\([^)]*\)/)?.[0];
    if (!tint) throw new Error("the card has no gradient stop to measure");
    const corner = over(tint, `rgb(${groundOf(card).join(",")})`);
    return {
      tinted: getComputedStyle(card).backgroundImage !== "none",
      title: ratio(over(getComputedStyle(title).color, `rgb(${corner.join(",")})`), corner),
      muted: ratio(over(getComputedStyle(muted).color, `rgb(${corner.join(",")})`), corner),
      icons: card.querySelectorAll('svg[aria-hidden="true"]').length,
    };
  });
  expect(m.tinted).toBe(true);
  expect(m.title).toBeGreaterThanOrEqual(4.5);
  expect(m.muted).toBeGreaterThanOrEqual(4.5);
  expect(m.icons).toBeGreaterThanOrEqual(3);
});

// ─── lo que trae el mensaje, y lo que pasa después de armar ──────────────────

const REAL_MESSAGE =
  "Partido de los miercoles \n\n⏳Miércoles 18.30hrs\n🏟️ Cancha: Quintana y Salta\n\n⬇️ Esta semana:\n\n1. Lucho\n2. Mura\n3. Mauro\n4. Lihue\n5. Eze \n6. Patru\n7. Mati\n8. Nacho\n9. Fede Camino\n10. Mati R\n11. Keis\n12.  Max";

test("pegar un mensaje real llena Lugar y Fecha y arma doce jugadores, no dieciséis", async ({ page }) => {
  const errors = watchConsole(page);
  await page.evaluate((m) => navigator.clipboard.writeText(m), REAL_MESSAGE);
  await page.getByRole("button", { name: "Pegar lista desde el portapapeles" }).click();
  await expect(page.locator("#location")).toHaveValue("Quintana y Salta");
  await expect(page.locator("#date")).toHaveValue(/^\d{4}-\d{2}-\d{2}T18:30$/);
  await page.locator("#organizer").fill("Hernán");
  await page.locator("#price").fill("24000");
  await page.getByRole("button", { name: "Crear equipos" }).click();
  await page.waitForURL(`**${MATCH}`);
  await expect(rows(page)).toHaveCount(12);
  /* $ 24.000 over twelve is $ 2.000 a head, on the card. */
  await expect(page.getByText(/2\.000 cada uno/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("una baja saca la fila, dice qué equipo quedó corto, ajusta la cuota, y Sumar jugador la deshace", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.evaluate((m) => navigator.clipboard.writeText(m), REAL_MESSAGE);
  await page.getByRole("button", { name: "Pegar lista desde el portapapeles" }).click();
  await page.locator("#organizer").fill("Hernán");
  await page.locator("#price").fill("24000");
  await page.getByRole("button", { name: "Crear equipos" }).click();
  await page.waitForURL(`**${MATCH}`);

  await page.getByRole("button", { name: /^Opciones de Mura/ }).click();
  await page.getByRole("menuitem", { name: "Dar de baja" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText(/Falta uno en/)).toBeVisible();
  /* Eleven left: $ 24.000 / 11 rounds up to $ 2.182. */
  await expect(page.getByText(/2\.182 cada uno/)).toBeVisible();

  await expect(rows(page)).toHaveCount(11);
  await expect(rows(page).filter({ hasText: "Mura" })).toHaveCount(0);
  await expect(page.getByText(/Mura se dio de baja/)).toBeVisible();

  /* The undo lives where the hole is: Sumar jugador offers Mura first. */
  await page.getByRole("button", { name: "Sumar jugador" }).click();
  await page.getByRole("group", { name: "Suplentes" }).getByRole("button", { name: "Mura" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(rows(page)).toHaveCount(12);
  await expect(page.getByText(/Falta uno en/)).toHaveCount(0);
  await expect(page.getByText(/2\.000 cada uno/)).toBeVisible();
  await expect(page.getByText(/volvió a sumarse/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("Nueva lista propone la fecha del próximo partido y recuerda el precio", async ({ page }) => {
  await page.evaluate((m) => navigator.clipboard.writeText(m), REAL_MESSAGE);
  await page.getByRole("button", { name: "Pegar lista desde el portapapeles" }).click();
  await page.locator("#organizer").fill("Hernán");
  await page.locator("#price").fill("24000");
  await page.getByRole("button", { name: "Crear equipos" }).click();
  await page.waitForURL(`**${MATCH}`);
  await page.goto(HOME);
  await expect(page.locator("#date")).toHaveValue(/T18:30$/);
  await expect(page.locator("#price")).toHaveValue("24000");
});

test("con cupo, los que sobran son suplentes y Reemplazar los ofrece con un toque", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con suplentes");
  await expect(rows(page)).toHaveCount(12);
  await expect(page.locator("p", { hasText: "Suplentes:" })).toContainText("Nico, Juan");

  await page.getByRole("button", { name: /^Opciones de Mura/ }).click();
  await page.getByRole("menuitem", { name: "Reemplazar" }).click();
  const choices = page.getByRole("group", { name: "Suplentes" });
  await expect(choices.getByRole("button")).toHaveCount(2);
  await choices.getByRole("button", { name: "Nico" }).click();
  await expect(page.locator('[data-testid="dialog-input"]')).toHaveValue("Nico");
  await page.getByRole("button", { name: "Confirmar" }).click();

  /* Nico is on the pitch in Mura's row, off the waiting list, and the history says who came in. */
  await expect(rows(page).filter({ hasText: "Nico" })).toHaveCount(1);
  await expect(page.locator("p", { hasText: "Suplentes:" })).toContainText("Juan");
  await expect(page.locator("p", { hasText: "Suplentes:" })).not.toContainText("Nico");
  await expect(page.getByText(/reemplazado por/)).toBeVisible();
  await expect(page.getByText(/Falta uno en/)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("el cupo dice cuántos faltan cuando la lista no lo llena", async ({ page }) => {
  await page
    .locator("textarea")
    .fill("1. Lucho\n2. Mura\n3. Mauro\n4. Lihue\n5. Eze\n6. Patru\n7. Mati\n8. Nacho\n9. Fede\n10. Keis");
  await page.locator("#organizer").fill("Hernán");
  await page.locator("#location").fill("Quintana y Salta");
  await page.locator("#capacity").fill("12");
  const soon = new Date(Date.now() + 3 * 864e5);
  const pad = (n: number) => String(n).padStart(2, "0");
  await page.locator("#date").fill(`${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T20:30`);
  await page.getByRole("button", { name: "Crear equipos" }).click();
  await page.waitForURL(`**${MATCH}`);
  await expect(page.getByText(/Faltan 2 para completar el cupo de 12/)).toBeVisible();
});

test("con suplentes, Dar de baja pregunta quién entra y el historial cuenta una sola cosa", async ({ page }) => {
  await openFixture(page, "Con suplentes");
  await page.getByRole("button", { name: /^Opciones de Keis/ }).click();
  await page.getByRole("menuitem", { name: "Dar de baja" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Keis se baja. ¿Quién entra?");
  const choices = page.getByRole("group", { name: "Suplentes" });
  await expect(choices.getByRole("button", { name: "Nadie, queda afuera" })).toBeVisible();
  await choices.getByRole("button", { name: "Nico" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(rows(page).filter({ hasText: "Nico" })).toHaveCount(1);
  await expect(page.getByText(/Falta uno en/)).toHaveCount(0);
  await expect(page.getByText(/se dio de baja/)).toHaveCount(0);
  await expect(page.getByText(/reemplazado por/)).toBeVisible();
});

test("el cupo arranca en 12", async ({ page }) => {
  await expect(page.locator("#capacity")).toHaveValue("12");
});

test("un suplente con el nombre de alguien que ya estaba es el (2), aunque su fila quede más arriba", async ({
  page,
}) => {
  await openFixture(page, "Con suplentes");
  /* Lucho is the first row; a second Keis takes it, above the Keis who signed up first. */
  await page.getByRole("button", { name: /^Opciones de Lucho/ }).click();
  await page.getByRole("menuitem", { name: "Reemplazar" }).click();
  await page.locator('[data-testid="dialog-input"]').fill("Keis");
  await page.getByRole("button", { name: "Confirmar" }).click();
  const first = rows(page).first();
  await expect(first).toContainText("Keis");
  await expect(first).toContainText("(2)");
  await expect(rows(page).filter({ hasText: "(1)" })).toContainText("Keis");
});

test("a la lista impar se le puede sumar el que falta, del lado que falta", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con lista impar (11)");
  await expect(page.getByText(/Falta uno en/)).toBeVisible();
  /* Only the short side offers it; the picture never does. */
  const add = page.getByRole("button", { name: "Sumar jugador" });
  await expect(add).toHaveCount(1);
  await expect(add.locator("xpath=ancestor::*[@data-share='hide']")).toHaveCount(1);
  await add.click();
  await page.locator('[data-testid="dialog-input"]').fill("Nico");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(rows(page)).toHaveCount(12);
  await expect(page.getByText(/Falta uno en/)).toHaveCount(0);
  await expect(page.getByText(/Nico se sumó/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sumar jugador" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("el que entró por otro también puede bajarse, y el historial lo nombra a él", async ({ page }) => {
  await openFixture(page, "Con un cambio y una baja");
  /* Nico came in for Mauro; his row has to allow the same three actions as any other. */
  await page.getByRole("button", { name: /^Opciones de Mauro/ }).click();
  await expect(page.getByRole("menuitem", { name: "Dar de baja" })).toBeEnabled();
  await expect(page.getByRole("menuitem", { name: "Reemplazar" })).toBeEnabled();
  await page.getByRole("menuitem", { name: "Dar de baja" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Nico");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(rows(page)).toHaveCount(10);
  await expect(page.getByText(/Nico se dio de baja/)).toBeVisible();
});
