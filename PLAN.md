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
- **Compartir:** texto armado a WhatsApp, no link.
- **Modo dev:** barra flotante con acciones, solo bajo `NODE_ENV === "development"`.
- **Fuera de alcance:** PWA, offline, estado en servidor, stats, balanceo por nivel.

## Fases

- [x] **1. Tests y corrección.** Vitest + tests que reproducen los bugs, después los fixes.
- [x] **2. Mobile y accesibilidad.** Menú alcanzable en touch, targets de 44px, zoom, focus.
- [x] **3. Solo oscuro.** Sacar el switcher y las ~40 clases `dark:`, tokens semánticos.
- [ ] **4. Kit.** Unión discriminada `Kit`, `KitSelector`, migración del store con zod.
- [x] **5. Barra de dev.** Fixture de la lista habitual, compartido con los tests.
- [ ] **6. Pegado, compartir, lista habitual.** Parseo del mensaje de WhatsApp.
- [ ] **7. Dieta de dependencias.** lodash, sweetalert2, framer-motion, react-laag, cva.
- [ ] **8. Toolchain.** Headless UI v2, ESLint, Next 16, `@dnd-kit`.

## Bugs (fase 1 y 2)

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
- [x] Botones de solo ícono sin `aria-label`: `ListInput:37`, `WelcomeModal:70`.

## Comandos

```bash
yarn test          # vitest run
yarn test:watch    # vitest
yarn check         # tsc --noEmit && lint && tests
yarn dev
```
