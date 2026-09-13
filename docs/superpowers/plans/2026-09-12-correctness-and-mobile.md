# Corrección y Mobile — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar la app correcta y usable desde el celular: eliminar los bugs que corrompen la
lista de jugadores en silencio y hacer alcanzables desde touch las acciones que hoy dependen
de hover.

**Architecture:** Se mantiene todo del lado del cliente. La lógica que vale la pena testear
(parseo de la lista pegada y armado de los equipos) se vuelve pura y sale de los hooks, de
modo que los tests no necesiten React ni zustand. El resto son correcciones puntuales sobre
componentes existentes.

**Tech Stack:** Next 15.4.6, React 19, TypeScript 5, Tailwind CSS v4, zustand 4, Vitest 5.

## Global Constraints

- Gestor de paquetes: `yarn`. Nunca `npm install`.
- Alias de imports: `@/*` apunta a `./src/*`.
- Los comentarios de código se escriben en inglés. El texto visible al usuario, en español.
- Componentes funcionales, sin clases. `function` para funciones puras.
- Interfaces antes que types. Sin enums: mapas.
- Esta entrega no agrega ni quita dependencias de runtime. Vitest entra como `devDependency`.
- Esta entrega no toca el tema claro/oscuro: las clases `dark:` se eliminan en la fase 3.
- Ningún cambio de este plan altera el modelo de datos persistido en `localStorage`.

## Alcance

Cubre las fases 1 y 2 del spec `docs/superpowers/specs/2026-09-12-teammaker-refresh-design.md`.
Las fases 3 a 8 (solo oscuro, kit, barra de dev, pegado y compartir, dieta de dependencias,
toolchain) tienen sus propios planes.

Tres puntos del spec quedan deliberadamente afuera porque están acoplados a fases posteriores:

- El rediseño de `details` (spec 5.3, "Fede Camino" mostrándose como "Fede (Camino)") se hace
  junto al parseo inteligente del pegado en la fase 6, que es donde el parser se reescribe.
- El `@ts-expect-error` de `useAlert.ts:21` desaparece cuando se saca `sweetalert2` en la
  fase 7.
- El `eslint-disable` de `match/page.tsx:45` está sobre un efecto que llama a `alert`, así que
  también se resuelve al sacar `sweetalert2` en la fase 7.

## Estructura de archivos

**Crear:**

| Archivo | Responsabilidad |
| --- | --- |
| `vitest.config.ts` | Configuración del runner, con el alias `@` |
| `src/utils/index.test.ts` | Tests de parseo de nombres, armado de equipos y validación |

**Modificar:**

| Archivo | Cambio |
| --- | --- |
| `package.json` | `vitest` en devDependencies, scripts `test` y `test:watch` |
| `src/utils/index.ts` | Regex unicode, sin deduplicación silenciosa, `splitTeams`, ids estables |
| `src/hooks/usePlayers.ts:17-20` | Consume `splitTeams` en lugar de calcular el corte inline |
| `src/components/PlayersList/index.tsx:40,56` | Key estable, menú visible en touch, label del menú |
| `src/components/PlayerName/index.tsx:50-58` | Alto mínimo de 44px |
| `src/components/FloatingMenu/index.tsx:11,32` | Prop `label` para el `aria-label` del trigger |
| `src/app/layout.tsx:12-22,29,33` | Zoom, `lang`, `color-scheme`, clases muertas, descripción |
| `src/components/ListInput/index.tsx:37` | `aria-label` en el botón de pegar |
| `src/components/WelcomeModal/index.tsx:70` | `aria-label` en el submit |
| `src/components/Button/index.tsx` | Prop `aria-label` y foco visible |
| `src/components/ToggleSwitch/index.tsx:17-21` | Clase inexistente, foco visible, label real |
| `src/components/EditModal/index.tsx:31` | Elimina el `console.log` |

---

### Task 1: Harness de tests

Instala Vitest y cubre con tests el comportamiento que **hoy ya funciona**, para tener red de
seguridad antes de tocar nada. Estos tests pasan contra el código actual.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/utils/index.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `generatePlayer` y `generatePlayers` de `src/utils/index.ts`, tal como están hoy.
- Produces: el comando `yarn test`, que los tasks siguientes usan para verificar.

- [ ] **Step 1: Instalar Vitest**

```bash
yarn add -D vitest@5
```

- [ ] **Step 2: Crear la configuración**

Los tests son de lógica pura, así que corren en `node` y no necesitan jsdom.

`vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Agregar los scripts**

En `package.json`, dentro de `scripts`, agregar `test` y `test:watch`, y sumar los tests al
`check` que ya existe:

```json
    "test": "vitest run",
    "test:watch": "vitest",
    "check": "tsc --noEmit && next lint && vitest run"
```

- [ ] **Step 4: Escribir los tests de regresión**

`src/utils/index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generatePlayer, generatePlayers } from "@/utils";

describe("generatePlayer", () => {
  it("uses the first word as the name and the rest as details", () => {
    const player = generatePlayer("Fede Camino");

    expect(player.name).toBe("Fede");
    expect(player.details).toBe("Camino");
  });

  it("leaves details empty for single-word names", () => {
    expect(generatePlayer("Lucho").details).toBe("");
  });
});

describe("generatePlayers", () => {
  it("strips the list numbering that comes from the pasted message", () => {
    const players = generatePlayers("1. Lucho\n2. Mura\n3. Mauro");

    expect(players.map((p) => p.name)).toEqual(["Lucho", "Mura", "Mauro"]);
  });

  it("ignores blank lines", () => {
    expect(generatePlayers("1. Lucho\n\n\n2. Mura")).toHaveLength(2);
  });
});
```

- [ ] **Step 5: Verificar que pasan**

Run: `yarn test`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/utils/index.test.ts package.json yarn.lock
git commit -m "test: add vitest harness with regression tests for player parsing"
```

---

### Task 2: Nombres repetidos descartados en silencio

`generatePlayers` aplica `uniq()` sobre los nombres ya normalizados, así que dos personas que
se escriben igual en la lista de WhatsApp se convierten en una sola y nadie se entera. Perder
un jugador real es peor que mostrar un duplicado que se puede dar de baja desde el menú, así
que se conservan ambos.

**Files:**
- Modify: `src/utils/index.ts:19-27`
- Test: `src/utils/index.test.ts`

**Interfaces:**
- Consumes: `generatePlayers(str: string): Player[]`.
- Produces: misma firma. A partir de acá `generatePlayers` nunca reduce la cantidad de líneas
  con nombre válido que recibió.

- [ ] **Step 1: Escribir el test que falla**

Agregar dentro del `describe("generatePlayers")` de `src/utils/index.test.ts`:

```ts
  it("keeps both players when two people share the same name", () => {
    const players = generatePlayers("1. Mati\n2. Nacho\n3. Mati");

    expect(players.map((p) => p.name)).toEqual(["Mati", "Nacho", "Mati"]);
  });

  it("keeps the twelve players of the usual list", () => {
    const list = [
      "1. Lucho",
      "2. Mura",
      "3. Mauro",
      "4. Lihue",
      "5. Eze",
      "6. Patru",
      "7. Mati",
      "8. Nacho",
      "9. Fede Camino",
      "10. Mati R",
      "11. Keis",
      "12. Max",
    ].join("\n");

    expect(generatePlayers(list)).toHaveLength(12);
  });
```

- [ ] **Step 2: Verificar que falla**

Run: `yarn test`
Expected: FAIL. El primer test recibe `["Mati", "Nacho"]` en lugar de tres nombres.

El segundo test pasa hoy, porque "Mati" y "Mati R" son strings distintos. Queda como
protección: es la lista real y es la que tiene que sobrevivir a cualquier cambio futuro del
parser.

- [ ] **Step 3: Quitar la deduplicación**

En `src/utils/index.ts`, reemplazar `generatePlayers` completa:

```ts
export function generatePlayers(str: string): Player[] {
  return str
    .split("\n")
    .map((line) => line.replace(/[0-9.]/g, "").trim())
    .filter((line) => line !== "")
    .map((line) => generatePlayer(line));
}
```

Y eliminar `uniq` del import de lodash en la línea 2, que queda como
`import { uniqueId } from "lodash";`.

- [ ] **Step 4: Verificar que pasan**

Run: `yarn test`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/index.ts src/utils/index.test.ts
git commit -m "fix: stop dropping players who share a name with someone else"
```

---

### Task 3: El jugador del medio queda en los dos equipos

`teamA` es `slice(0, half)` y `teamB` es `slice(-half)`. Con una lista impar los dos rangos se
solapan en un índice. Con 11 jugadores, `half` es 6 y el índice 5 aparece en ambos equipos.

El corte se extrae a una función pura para poder testearlo sin montar React ni zustand.

**Files:**
- Modify: `src/utils/index.ts` (agrega `splitTeams`)
- Modify: `src/hooks/usePlayers.ts:17-20`
- Test: `src/utils/index.test.ts`

**Interfaces:**
- Consumes: el tipo `Player` de `@/types`.
- Produces: `splitTeams(players: Player[]): { teamA: Player[]; teamB: Player[] }`. `usePlayers`
  sigue exponiendo `teamA` y `teamB` con la misma forma que antes, así que `/match` no cambia.

- [ ] **Step 1: Escribir el test que falla**

Primero, actualizar el import de la primera línea del archivo para que incluya `splitTeams`:

```ts
import { generatePlayer, generatePlayers, splitTeams } from "@/utils";
```

Después, agregar este `describe` al final de `src/utils/index.test.ts`:

```ts
describe("splitTeams", () => {
  const playersNamed = (count: number) =>
    generatePlayers(Array.from({ length: count }, (_, i) => `Jugador${i}`).join("\n"));

  it("splits an even list in half", () => {
    const { teamA, teamB } = splitTeams(playersNamed(12));

    expect(teamA).toHaveLength(6);
    expect(teamB).toHaveLength(6);
  });

  it("puts the extra player on team A when the list is odd", () => {
    const { teamA, teamB } = splitTeams(playersNamed(11));

    expect(teamA).toHaveLength(6);
    expect(teamB).toHaveLength(5);
  });

  it("never puts the same player on both teams", () => {
    const { teamA, teamB } = splitTeams(playersNamed(11));
    const shared = teamA.filter((player) => teamB.some((other) => other.id === player.id));

    expect(shared).toEqual([]);
  });

  it("handles an empty list", () => {
    expect(splitTeams([])).toEqual({ teamA: [], teamB: [] });
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `yarn test`
Expected: FAIL con `splitTeams is not a function`.

- [ ] **Step 3: Implementar `splitTeams`**

Agregar en `src/utils/index.ts`, después de `generatePlayers`:

```ts
// teamB starts where teamA ends. Using slice(-half) overlaps by one on odd-sized lists.
export function splitTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  const half = Math.ceil(players.length / 2);

  return {
    teamA: players.slice(0, half),
    teamB: players.slice(half),
  };
}
```

- [ ] **Step 4: Verificar que pasan**

Run: `yarn test`
Expected: PASS, 10 tests.

- [ ] **Step 5: Consumirla desde el hook**

En `src/hooks/usePlayers.ts`, reemplazar las líneas 17 a 20:

```ts
  const half = Math.ceil(players?.length / 2);

  const teamA = players?.slice(0, half);
  const teamB = players?.slice(-half);
```

por:

```ts
  const { teamA, teamB } = splitTeams(players ?? []);
```

Y sumar `splitTeams` al import de `@/utils` de la línea 4, que queda como
`import { splitTeams, validateName } from "@/utils";`.

- [ ] **Step 6: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/utils/index.ts src/utils/index.test.ts src/hooks/usePlayers.ts
git commit -m "fix: stop placing the middle player on both teams when the list is odd"
```

---

### Task 4: Acentos y ñ borrados de los nombres

El rango `[a-zA-Z]` no incluye caracteres acentuados, así que "Martín" se guarda como "Martn"
e "Iñaki" como "Iaki". `validateName` rechaza los mismos caracteres, de modo que renombrar a
alguien con acento es imposible.

**Files:**
- Modify: `src/utils/index.ts:6-17,38-41`
- Test: `src/utils/index.test.ts`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `generatePlayer` y `validateName` conservan su firma. Cambia solo qué caracteres
  aceptan.

- [ ] **Step 1: Escribir los tests que fallan**

Agregar al `describe("generatePlayer")`:

```ts
  it("keeps accents and ñ", () => {
    expect(generatePlayer("Martín").name).toBe("Martín");
    expect(generatePlayer("Iñaki").name).toBe("Iñaki");
  });

  it("drops emoji and punctuation that come from the pasted message", () => {
    expect(generatePlayer("⚽ Lucho!").name).toBe("Lucho");
  });
```

Agregar al `describe("generatePlayers")`. Una línea que solo tiene emoji sobrevive al filtro
actual, porque el filtro corre antes de que se limpien los caracteres, y termina creando un
jugador con el nombre vacío:

```ts
  it("creates no player for a line that has no letters", () => {
    expect(generatePlayers("1. Lucho\n🏟️\n2. Mura")).toHaveLength(2);
  });
```

Y un `describe` nuevo al final del archivo:

```ts
describe("validateName", () => {
  it("accepts accents and ñ", () => {
    expect(validateName("Martín")).toBeUndefined();
    expect(validateName("Iñaki")).toBeUndefined();
  });

  it("rejects an empty name", () => {
    expect(validateName("")).toBe("Debes ingresar un nombre");
  });

  it("rejects digits", () => {
    expect(validateName("Mati 10")).toBe("Nombre inválido (solo letras, paréntesis y espacios)");
  });
});
```

Sumar `validateName` al import de la primera línea.

- [ ] **Step 2: Verificar que falla**

Run: `yarn test`
Expected: FAIL. `generatePlayer("Martín").name` devuelve `"Martn"`.

- [ ] **Step 3: Pasar los regex a unicode**

En `src/utils/index.ts`, reemplazar `generatePlayer`:

```ts
// \p{L} with the u flag covers accents and ñ, which the previous [a-zA-Z] range stripped
const NON_NAME_CHARS = /[^\p{L}\s]/gu;

export function generatePlayer(user_str: string): Player {
  const onlyLetters = user_str.replace(NON_NAME_CHARS, "").replace(/\s+/g, " ").trim();
  const [name, ...details] = onlyLetters.split(" ");

  return {
    id: uniqueId("player_"),
    name,
    details: details.join(" "),
  };
}
```

Mover el filtro de `generatePlayers` para que descarte los jugadores cuyo nombre quedó vacío
después de limpiar los caracteres, en lugar de filtrar la línea cruda:

```ts
export function generatePlayers(str: string): Player[] {
  return str
    .split("\n")
    .map((line) => generatePlayer(line))
    .filter((player) => player.name !== "");
}
```

Con esto una línea que solo tiene emoji deja de generar un jugador con el nombre vacío, y ya no
hace falta limpiar dígitos en dos lugares: `NON_NAME_CHARS` se encarga de la numeración de la
lista igual que del resto.

Ojo que esto **no** resuelve las líneas de metadatos del mensaje de WhatsApp: `🏟️ Cancha:
Quintana y Salta` sigue produciendo un jugador llamado "Cancha" con detalles "Quintana y
Salta", porque tiene letras. Eso es exactamente lo que ataca el parseo inteligente de la
fase 6.

Y `validateName`:

```ts
export const validateName = (value: string) => {
  if (!value?.trim()) return "Debes ingresar un nombre";
  if (!/^[\p{L}\s()]+$/u.test(value)) return "Nombre inválido (solo letras, paréntesis y espacios)";
};
```

- [ ] **Step 4: Verificar que pasan**

Run: `yarn test`
Expected: PASS, 16 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/index.ts src/utils/index.test.ts
git commit -m "fix: keep accents and ñ in player names"
```

---

### Task 5: Ids inestables y keys regeneradas en cada render

Dos problemas del mismo origen. `PlayersList` usa `key={uniqueId(...)}`, que produce una key
nueva en cada render y obliga a React a desmontar y remontar la lista entera. Y `uniqueId` es
un contador de módulo que arranca en cero en cada carga de página, así que después de recargar
un `replacePlayer` puede generar un id que ya existe en `localStorage`.

`crypto.randomUUID()` resuelve los dos: no colisiona entre sesiones y no depende de estado de
módulo.

**Files:**
- Modify: `src/utils/index.ts`
- Modify: `src/components/PlayersList/index.tsx:3,40`
- Test: `src/utils/index.test.ts`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `Player.id` pasa a ser un UUID en lugar de `player_N`. Nadie parsea el id, solo se
  compara por igualdad, así que el cambio es interno.

- [ ] **Step 1: Escribir el test que falla**

Un test unitario no puede observar directamente el reinicio del contador, porque dentro de una
misma corrida el módulo se carga una sola vez y los ids no se repiten. Lo que sí se puede
afirmar es la propiedad que necesitamos: que el id no dependa de un contador de sesión, y para
eso alcanza con exigir que tenga forma de UUID.

Agregar al `describe("generatePlayers")`:

```ts
  it("gives every player an id that cannot collide across page loads", () => {
    const [player] = generatePlayers("1. Mati");

    expect(player.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
```

- [ ] **Step 2: Verificar que falla**

Run: `yarn test`
Expected: FAIL. El id actual es `player_1`, que no matchea el patrón de UUID.

- [ ] **Step 3: Reemplazar el generador de ids**

En `src/utils/index.ts`, en `generatePlayer`, cambiar `id: uniqueId("player_")` por
`id: crypto.randomUUID()`, y eliminar el import de `uniqueId` de la línea 2. `lodash` sigue
usándose en otros archivos, así que la dependencia se mantiene: se saca en la fase 7.

- [ ] **Step 4: Verificar que pasan**

Run: `yarn test`
Expected: PASS, 17 tests.

- [ ] **Step 5: Usar una key estable en la lista**

En `src/components/PlayersList/index.tsx`, reemplazar la línea 40:

```tsx
            key={uniqueId(`${player.name}-${player.details}`)}
```

por:

```tsx
            key={player.id}
```

Y eliminar `import { uniqueId } from "lodash";` de la línea 3.

- [ ] **Step 6: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/utils/index.ts src/utils/index.test.ts src/components/PlayersList/index.tsx
git commit -m "fix: use stable uuids for players and stop regenerating list keys"
```

---

### Task 6: El menú de cada jugador es inalcanzable desde el celular

El ícono de tres puntitos es `hidden group-hover:block`. En una pantalla táctil no hay hover,
así que renombrar, reemplazar y dar de baja no existen en el dispositivo donde se usa la app.
Pasa a estar siempre visible, atenuado, y se refuerza al hover en desktop.

Las filas además miden unos 36px de alto y el mínimo recomendado para un objetivo táctil es 44.

**Files:**
- Modify: `src/components/PlayersList/index.tsx:39-58`
- Modify: `src/components/PlayerName/index.tsx:50-58`
- Modify: `src/components/FloatingMenu/index.tsx:5-11,32-34`

**Interfaces:**
- Consumes: `FloatingMenu` de `@/components/FloatingMenu`.
- Produces: `FloatingMenuProps` suma `label: string`, obligatoria, que alimenta el `aria-label`
  del botón que abre el menú. Todo consumidor de `FloatingMenu` debe pasarla.

- [ ] **Step 1: Hacer el ícono visible en touch**

En `src/components/PlayersList/index.tsx`, reemplazar la línea 56:

```tsx
                <EllipsisVerticalIcon className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:block" />
```

por:

```tsx
                <EllipsisVerticalIcon
                  aria-hidden="true"
                  className="h-5 w-5 absolute right-2 top-1/2 -translate-y-1/2 opacity-60 transition-opacity group-hover:opacity-100"
                />
```

- [ ] **Step 2: Dar nombre accesible al botón del menú**

En `src/components/FloatingMenu/index.tsx`, agregar `label` a la interface de la línea 5:

```tsx
interface FloatingMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  label: string;
}
```

Cambiar la firma de la línea 11 a
`const FloatingMenu: FC<FloatingMenuProps> = ({ trigger, children, className, label }) => {`
y el botón de la línea 32:

```tsx
      <button
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        {...triggerProps}
        onClick={() => setOpen(!isOpen)}
      >
```

- [ ] **Step 3: Pasar la prop desde la lista**

En `src/components/PlayersList/index.tsx`, dentro del `<FloatingMenu>` que arranca en la línea
39, agregar junto a `key`:

```tsx
            label={`Opciones de ${player.name}`}
```

- [ ] **Step 4: Llevar las filas a 44px**

En `src/components/PlayerName/index.tsx`, en el `classNames` de la línea 50, reemplazar la
primera cadena:

```tsx
        "flex gap-1 justify-center items-center w-full p-1 py-2 user-select-none",
```

por:

```tsx
        "flex min-h-11 gap-1 justify-center items-center w-full px-1 select-none touch-manipulation",
```

`min-h-11` son 44px. `touch-manipulation` elimina el retardo de 300ms del doble tap, y
`select-none` reemplaza a `user-select-none`, que no es una clase de Tailwind y por lo tanto
hoy no aplica nada.

- [ ] **Step 5: Verificar que compila y que los tests siguen verdes**

Run: `yarn tsc --noEmit && yarn test`
Expected: sin errores, 17 tests en PASS.

- [ ] **Step 6: Verificar a ojo en el navegador**

Run: `yarn dev`

Abrir `http://localhost:3000`, cargar una lista de 11 nombres y confirmar tres cosas: que los
tres puntitos se ven sin pasar el mouse, que ningún nombre aparece en los dos equipos, y que
en el emulador de dispositivo móvil del navegador el menú se abre al tocar.

- [ ] **Step 7: Commit**

```bash
git add src/components/PlayersList/index.tsx src/components/PlayerName/index.tsx src/components/FloatingMenu/index.tsx
git commit -m "fix: make the player menu reachable on touch devices"
```

---

### Task 7: Zoom bloqueado, idioma equivocado y clases muertas

`userScalable: false` junto con `maximumScale: 1` desactiva el pinch zoom, que es un
anti-patrón de accesibilidad. El documento declara `lang="en"` en una app enteramente en
español. Y hay tres clases que no aplican nada por estar mal escritas.

**Files:**
- Modify: `src/app/layout.tsx:12-22,29,33`
- Modify: `src/components/ToggleSwitch/index.tsx:17-21`
- Modify: `src/components/EditModal/index.tsx:31`

**Interfaces:**
- Consumes: `Viewport` de `next`.
- Produces: nada que otros tasks consuman.

- [ ] **Step 1: Corregir metadata y viewport**

En `src/app/layout.tsx`, reemplazar las líneas 12 a 22:

```tsx
export const metadata: Metadata = {
  title: "Team Maker",
  description: "Vos también podés crear equipos rápidamente y compartirlos con tus amigos!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#151d65",
};
```

`colorScheme` es lo que hace que los scrollbars y los inputs nativos se rendericen en oscuro,
y `themeColor` pinta la barra del navegador del color del fondo. Se van `maximumScale` y
`userScalable`, que bloqueaban el zoom.

- [ ] **Step 2: Corregir el idioma del documento**

Línea 29: `<html lang="en">` pasa a `<html lang="es">`.

- [ ] **Step 3: Eliminar las clases muertas**

En la línea 33, el `className` del `body` contiene `maxx-w-1200` (typo de `max-w-`) y
`w-95vw`, que en Tailwind v4 se escribiría `w-[95vw]`. Ninguna de las dos aplica nada hoy, así
que se **eliminan** en lugar de corregirse: escribirlas bien cambiaría el ancho actual del
layout. `h-screen` pasa a `min-h-dvh`, que evita el salto por la barra de direcciones en mobile
y permite que el contenido crezca:

```tsx
      className={classNames(
        inter.className,
        "grid grid-rows-[4rem_1fr] min-h-dvh text-white bg-primary-950 mx-auto"
      )}
```

- [ ] **Step 4: Corregir el ToggleSwitch**

En `src/components/ToggleSwitch/index.tsx`, reemplazar las líneas 16 a 21:

```tsx
    className={classNames(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-gray-700 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400",
      checked ? "bg-primary-600" : "bg-gray-400"
    )}
  >
    <span className="sr-only">Lista aleatoria</span>
```

Tres arreglos: `dark:bg-gray-8b00` no era una clase válida, `focus:outline-hidden` junto con
`ring-0` dejaba el control sin ningún indicador de foco, y el texto para lectores de pantalla
decía "Use setting".

- [ ] **Step 5: Eliminar el log olvidado**

En `src/components/EditModal/index.tsx`, borrar la línea 31:

```tsx
    console.log("🚀 ~ data:", data);
```

- [ ] **Step 6: Verificar**

Run: `yarn tsc --noEmit && yarn test && yarn lint`
Expected: sin errores, 17 tests en PASS.

- [ ] **Step 7: Verificar a ojo que el layout no cambió**

Run: `yarn dev`

Comparar `/` y `/match` con lo que había antes del cambio. `min-h-dvh` es el único cambio con
efecto visual posible: confirmar que el gradiente del `main` sigue llegando hasta abajo y que
en `/match` con 12 jugadores el contenido scrollea sin cortarse.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/components/ToggleSwitch/index.tsx src/components/EditModal/index.tsx
git commit -m "fix: restore pinch zoom, correct document language and remove dead classes"
```

---

### Task 8: Botones de ícono sin nombre y sin foco visible

`Button` no reenvía props, así que no hay forma de ponerle un `aria-label`: los dos botones que
solo tienen un ícono se anuncian vacíos en un lector de pantalla. Y ningún botón de la app
tiene indicador de foco.

**Files:**
- Modify: `src/components/Button/index.tsx`
- Modify: `src/components/ListInput/index.tsx:37`
- Modify: `src/components/WelcomeModal/index.tsx:70-76`

**Interfaces:**
- Consumes: `Button` de `@/components/Button`.
- Produces: `ButtonProps` suma `"aria-label"?: string`. Es opcional, así que los consumidores
  que ya existen no se tocan.

- [ ] **Step 1: Aceptar `aria-label` y agregar foco visible**

En `src/components/Button/index.tsx`, reemplazar el tipo y la firma:

```tsx
type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  variant = "primary",
  disabled,
  className,
  onClick,
  "aria-label": ariaLabel,
}) => {
```

Agregar el foco a la primera cadena del `classNames`:

```tsx
    "button px-4 py-2 rounded-md text-white flex items-center justify-center transition-colors duration-300 ease-in-out touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400",
```

Y pasarlo al elemento:

```tsx
    <button type={type} className={btnClasses} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
```

- [ ] **Step 2: Nombrar el botón de pegar**

En `src/components/ListInput/index.tsx`, línea 37:

```tsx
      <Button
        type="button"
        variant="secondary"
        aria-label="Pegar lista desde el portapapeles"
        className="absolute bottom-5 right-5"
        onClick={() => handlePaste()}
      >
```

- [ ] **Step 3: Nombrar el submit del modal de bienvenida**

En `src/components/WelcomeModal/index.tsx`, agregar a la línea 70 el label y el foco visible.
Este botón es un `<button>` nativo, no el componente `Button`:

```tsx
                  <button
                    type="submit"
                    aria-label="Confirmar nombre"
                    className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
```

- [ ] **Step 4: Verificar**

Run: `yarn tsc --noEmit && yarn test && yarn lint`
Expected: sin errores, 17 tests en PASS.

- [ ] **Step 5: Verificar el foco con teclado**

Run: `yarn dev`

En `/`, recorrer el formulario con Tab y confirmar que cada control muestra un anillo de foco
visible, incluido el botón de pegar y el toggle de aleatorio.

- [ ] **Step 6: Commit**

```bash
git add src/components/Button/index.tsx src/components/ListInput/index.tsx src/components/WelcomeModal/index.tsx
git commit -m "fix: add accessible names to icon buttons and visible focus rings"
```

---

## Verificación final

- [ ] `yarn check` pasa completo: tipos, lint y los 17 tests.
- [ ] Con una lista de 11 nombres, los equipos son 6 y 5, y nadie aparece dos veces.
- [ ] Con la lista real de 12, incluidos "Fede Camino" y "Mati R", se crean 12 jugadores.
- [ ] Una lista con dos "Mati" idénticos crea dos jugadores, no uno.
- [ ] Un nombre con acento sobrevive al pegado y también al renombrado.
- [ ] En el emulador móvil, los tres puntitos se ven y el menú se abre al tocar.
- [ ] El pinch zoom funciona.
