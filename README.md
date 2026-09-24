<a href="https://codeclimate.com/github/hercase/teammaker/maintainability"><img src="https://api.codeclimate.com/v1/badges/f7ee15a81b21fa9f2b3c/maintainability" /></a>

# Teammaker

Parte en dos equipos la lista de jugadores que circula por el grupo de WhatsApp. Todo vive en
`localStorage`: no hay servidor, ni base de datos, ni URL por partido.

Los equipos se comparten como imagen — el botón Compartir dibuja la lista y la manda al share
nativo del teléfono, sin los menús ni los botones de la pantalla.

## Empezar

```bash
yarn            # yarn, no npm
yarn dev        # http://localhost:3200
```

## Comandos

```bash
yarn run check     # tsc --noEmit && next lint && vitest run — la puerta antes de cualquier commit
yarn test          # vitest run
yarn test:watch    # vitest
yarn build
```

`yarn run check`, no `yarn check`: `check` es un builtin de yarn 1 y hace otra cosa.

No corras `yarn build` ni borres `.next` con `yarn dev` andando — comparten `.next` y el dev server
se queda sirviendo 404 de sus propios chunks.

## Cómo está hecho

Next 15 (App Router) · React 19 · TypeScript · Tailwind v4 · zustand con `persist` · Vitest.

| | |
| --- | --- |
| Formularios | `react-hook-form` |
| Diálogos | `@headlessui/react`, un único `ConfirmDialog` en el layout |
| Menú de fila | `react-laag` |
| Arrastrar jugadores | `react-dnd` (solo desktop) |
| Fechas | `date-fns` |
| Imagen para compartir | `html-to-image`, importada recién al tocar el botón |
| Íconos | `@heroicons/react` |

## Antes de tocar nada

[`CLAUDE.md`](CLAUDE.md) tiene las decisiones de diseño, el modelo de nombres y de kit, y las
trampas que ya costaron tiempo. [`PLAN.md`](PLAN.md) tiene el estado de las fases del refresh.
