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
const SIDE_VALUES = ["A", "B"];

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
  await page
    .locator("label", { hasText: /^Equipo B$/ })
    .first()
    .click();
  expect(await checkedValue(page, SIDE_VALUES)).toBe("B");

  /* Picking the other team's colour swaps them; two teams never wear the same shirt. */
  await page.getByText("Colores", { exact: true }).click();
  expect(await checkedValue(page, MODE_VALUES)).toBe("shirts");
  const teamA = page.getByRole("radiogroup", { name: "Camiseta del equipo A" });
  const teamB = page.getByRole("radiogroup", { name: "Camiseta del equipo B" });
  await expect(teamA.getByRole("radio", { name: "Blanca" })).toBeChecked();
  await expect(teamB.getByRole("radio", { name: "Azul" })).toBeChecked();
  await teamA.locator("label", { has: page.getByRole("radio", { name: "Azul" }) }).click();
  await expect(teamA.getByRole("radio", { name: "Azul" })).toBeChecked();
  await expect(teamB.getByRole("radio", { name: "Blanca" })).toBeChecked();

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
    /* The three mode cards, told apart from the radios nested inside the chosen one by their value. */
    const cards = [...document.querySelectorAll<HTMLElement>(".radio-group > .radio")].filter((c) =>
      ["shades", "shirts", "bibs"].includes(c.querySelector<HTMLInputElement>("input[type=radio]")?.value ?? "")
    );
    const chosen = cards.find((c) => c.querySelector(".kit-settings"))!;
    const other = cards.find((c) => !c.querySelector(".kit-settings"))!;
    const head = chosen.querySelector<HTMLElement>(".radio__content")!;
    const settings = chosen.querySelector<HTMLElement>(".kit-settings")!;
    const separator = chosen.querySelector<HTMLElement>(".separator")!;
    const hint = head.querySelector<HTMLElement>("span > span:last-child")!;

    const settingsGround = groundOf(settings);
    const headGround = groundOf(head);
    const otherGround = groundOf(other);

    const cardRects = cards.map((c) => c.getBoundingClientRect());
    const gapsBetweenCards = cardRects.slice(1).map((r, i) => Math.round(r.top - cardRects[i].bottom));
    const targets = [...settings.querySelectorAll<HTMLElement>(".radio")].map((t) => t.getBoundingClientRect());
    const gapsBetweenTargets = targets
      .slice(1)
      .map((r, i) => Math.round(r.left - targets[i].right))
      .filter((g) => g >= 0);

    return {
      optionVsSettings: ratio(headGround, settingsGround),
      separatorVsSettings: ratio(
        over(getComputedStyle(separator).backgroundColor, rgb(settingsGround)),
        settingsGround
      ),
      chosenVsOther: ratio(headGround, otherGround),
      hintOnChosen: ratio(over(getComputedStyle(hint).color, rgb(headGround)), headGround),
      hintSize: parseFloat(getComputedStyle(hint).fontSize),
      gapsBetweenCards,
      targetHeights: [...new Set(targets.map((r) => Math.round(r.height)))],
      minTargetWidth: Math.min(...targets.map((r) => Math.round(r.width))),
      minGapBetweenTargets: Math.min(...gapsBetweenTargets),
    };
    function rgb(c: number[]) {
      return `rgb(${c.join(",")})`;
    }
  });

  /* The option lit, its settings dark, and a line that clears 3:1 where --border read 1.07:1. */
  expect(m.optionVsSettings).toBeGreaterThanOrEqual(1.8);
  expect(m.separatorVsSettings).toBeGreaterThanOrEqual(3);
  /* Selection by fill, no white ring: it was 1.24:1 against the unchosen cards. */
  expect(m.chosenVsOther).toBeGreaterThanOrEqual(2);
  expect(m.hintOnChosen).toBeGreaterThanOrEqual(4.5);
  expect(m.hintSize).toBeGreaterThanOrEqual(12);
  /* 8px between cards, not HeroUI's mt-4 on top of it. */
  expect(m.gapsBetweenCards).toEqual([8, 8]);
  expect(m.targetHeights).toEqual([44]);
  /* Seven shirts across a 390px phone: 39px wide each, and the height is what holds at 44. */
  expect(m.minTargetWidth).toBeGreaterThanOrEqual(38);
  expect(m.minGapBetweenTargets).toBeGreaterThanOrEqual(8);
});

test("el selector de kit en Colores no desborda un teléfono de 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByText("Colores", { exact: true }).click();
  const m = await page.evaluate(() => {
    const targets = [...document.querySelectorAll<HTMLElement>(".kit-settings .radio")].map((t) =>
      t.getBoundingClientRect()
    );
    return {
      scrollWidth: document.documentElement.scrollWidth,
      heights: [...new Set(targets.map((r) => Math.round(r.height)))],
      minWidth: Math.min(...targets.map((r) => Math.round(r.width))),
    };
  });
  /* It overflowed to 382px. Seven in a row cannot be 44 wide here; the height is what holds. */
  expect(m.scrollWidth).toBe(320);
  expect(m.heights).toEqual([44]);
  expect(m.minWidth).toBeGreaterThanOrEqual(28);
});

// ─── persistencia ─────────────────────────────────────────────────────────────

test("el kit, el lado y el nombre persisten sin crear nada", async ({ page }) => {
  const errors = watchConsole(page);
  await page.getByText("Pecheras", { exact: true }).click();
  await page
    .locator("label", { hasText: /^Equipo B$/ })
    .first()
    .click();
  await page.locator("#organizer").fill("Hernán");
  await page.waitForTimeout(400);

  await page.reload({ waitUntil: "networkidle" });
  expect(await checkedValue(page, MODE_VALUES)).toBe("bibs");
  expect(await checkedValue(page, SIDE_VALUES)).toBe("B");
  await expect(page.locator("#organizer")).toHaveValue("Hernán");
  expect(errors).toEqual([]);
});

// ─── partido ──────────────────────────────────────────────────────────────────

test("el menú de fila: abre desde el ⋮, renombra, se cierra con Escape y no se abre al arrastrar", async ({ page }) => {
  const errors = watchConsole(page);
  await openFixture(page, "Con un cambio y una baja");
  await expect(rows(page)).toHaveCount(12);

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
  const home = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const track = document.querySelector<HTMLElement>(".switch__control")!;
    const paste = document.querySelector<HTMLElement>('button[aria-label^="Pegar"]')!;
    const g = (el: Element) => groundOf(el.parentElement!);
    return {
      track: ratio(over(getComputedStyle(track).backgroundColor, `rgb(${g(track).join(",")})`), g(track)),
      outline: ratio(over(getComputedStyle(paste).borderColor, `rgb(${g(paste).join(",")})`), g(paste)),
    };
  });
  expect(home.track).toBeGreaterThanOrEqual(3);
  expect(home.outline).toBeGreaterThanOrEqual(3);

  await page.getByText("Pecheras", { exact: true }).click();
  const side = await page.evaluate(() => {
    const { over, ratio, groundOf } = window.__c;
    const unset = [...document.querySelectorAll<HTMLElement>(".kit-settings .radio")].find(
      (r) => !r.className.includes("bg-segment")
    )!;
    const chosen = [...document.querySelectorAll<HTMLElement>(".kit-settings .radio")].find((r) =>
      r.className.includes("bg-segment")
    )!;
    const ground = groundOf(unset.parentElement!);
    return {
      unsetBorder: ratio(over(getComputedStyle(unset).borderTopColor, `rgb(${ground.join(",")})`), ground),
      chosenFill: ratio(over(getComputedStyle(chosen).backgroundColor, `rgb(${ground.join(",")})`), ground),
    };
  });
  expect(side.unsetBorder).toBeGreaterThanOrEqual(3);
  expect(side.chosenFill).toBeGreaterThanOrEqual(1.8);

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
