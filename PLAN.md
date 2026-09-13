# Refresh 2026 — Progreso

Rama: `feat/refresh-2026`
Diseño completo: [`docs/superpowers/specs/2026-09-12-teammaker-refresh-design.md`](docs/superpowers/specs/2026-09-12-teammaker-refresh-design.md)

Este archivo es solo el checklist. El razonamiento, las alternativas descartadas y las
referencias `file:line` de cada bug están en el spec.

## Decisiones cerradas (no volver a discutir)

- **Tema:** solo oscuro. Se eliminan `ThemeSwitcher` y `usePrefersColorScheme`.
- **Kit:** se elige en el formulario de creación, con presets únicamente. Colores de camiseta
  O pecheras, mutuamente excluyentes vía unión discriminada. Reutilizable en `EditModal`.
- **Arquitectura:** sigue local con `localStorage`. Sin base de datos, sin URL por partido.
- **Compartir:** imagen generada de los equipos + share nativo, no link ni texto. La gente
  mandaba capturas de pantalla; el botón hace la captura bien, sin los menús ni los botones.
- **Modo dev:** barra flotante con acciones, solo bajo `NODE_ENV === "development"`.
- **Fuera de alcance:** PWA, offline, estado en servidor, stats, balanceo por nivel.

## Fases

- [x] **1. Tests y corrección.** Vitest + tests que reproducen los bugs, después los fixes.
- [x] **2. Mobile y accesibilidad.** Menú alcanzable en touch, targets de 44px, zoom, focus.
- [x] **3. Solo oscuro.** Sacar el switcher y las ~40 clases `dark:`, tokens semánticos.
- [x] **4. Kit.** Unión discriminada `Kit`, `KitSelector`, migración del store (a mano, sin zod:
      `parseKit` valida la forma persistida y cae al default).
- [x] **5. Barra de dev.** Fixture de la lista habitual, compartido con los tests.
- [~] **6. Pegado, compartir, lista habitual.** Compartir hecho. **El parseo del mensaje de
      WhatsApp sigue pendiente y es el bug abierto más grande** — ver `CLAUDE.md`.
- [~] **7. Dieta de dependencias.** sweetalert2, framer-motion y `@types/react-datepicker`
      (huérfano) fuera. Quedan lodash (dos `shuffle`), react-laag (un menú) y tinycolor2 (solo
      para migrar partidos viejos). `cva` nunca se instaló: era una idea del spec, no una deuda.
- [ ] **8. Toolchain.** Headless UI v2, ESLint, Next 16, `@dnd-kit`.

## Bugs (fase 1 y 2)

> Las referencias `file:line` son de antes de las reescrituras y ya no apuntan al código citado.
> Sirven como historia, no para navegar.

- [x] `utils/index.ts:22` — `uniq()` descarta en silencio un jugador cuando dos se escriben igual.
- [x] `hooks/usePlayers.ts:19-20` — `slice(-half)` pone al jugador del medio en los dos equipos con lista impar.
- [x] `utils/index.ts:8,40` — `[a-zA-Z]` come acentos y ñ.
- [x] `utils/index.ts:13` — `uniqueId` es un contador de módulo: colisiona con ids ya persistidos.
- [x] `PlayersList/index.tsx:40` — key regenerada en cada render, remonta la lista entera.
- [x] `PlayersList/index.tsx:56` — `hidden group-hover:block`, inalcanzable en touch.
- [x] `layout.tsx:20-21` — `userScalable: false` desactiva el pinch zoom.
- [x] `layout.tsx:29` — `lang="en"` en una app en español.
- [x] `layout.tsx:33` — `maxx-w-1200` y `w-95vw`, clases muertas; `h-screen` debería ser `min-h-dvh`.
- [x] `layout.tsx:14` — la descripción dice "compartilos de con tus amigos".
- [x] `ToggleSwitch/index.tsx:18,21` — `dark:bg-gray-8b00` inexistente, sin focus visible, label "Use setting".
- [x] `Button/index.tsx` — sin `focus-visible` y sin forma de pasar `aria-label`.
- [x] `EditModal/index.tsx:31` — `console.log` olvidado.
- [x] Botones de solo ícono sin `aria-label`: `ListInput`, el modal de bienvenida (ya eliminado).

## Reglas del proyecto

Las decisiones de diseño, el modelo de nombres, las trampas ya pagadas y lo que falta están en
[`CLAUDE.md`](CLAUDE.md). Este archivo es solo el estado de las fases.

## Comandos

```bash
yarn test          # vitest run
yarn test:watch    # vitest
yarn run check     # tsc --noEmit && lint && tests (yarn check es otra cosa)
yarn dev
```
