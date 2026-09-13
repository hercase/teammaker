# Teammaker Refresh 2026 — Diseño

Fecha: 2026-09-12
Rama: `feat/refresh-2026`

## 1. Contexto

La app se escribió antes de que hubiera asistencia de AI y no se tocó en mucho tiempo. Se usa
en un partido semanal de 12 jugadores, los miércoles 18:30 en Quintana y Salta, desde el
celular. El flujo real es: pegar la lista que circula por WhatsApp, crear los equipos, y
sacarle un screenshot para volver a mandarla al grupo.

Dos problemas concretos motivaron esta revisión:

1. Nadie descubre que se pueden elegir los colores de las camisetas. Lo que la gente quería
   marcar era simplemente qué equipo juega con pecheras.
2. No hay data precargada para desarrollar, así que cada prueba local arranca de cero.

Auditando el código con las guidelines de Vercel aparecieron además varios bugs de
corrección, y deuda técnica acumulada en dependencias y límites entre componentes.

## 2. Decisiones

| Decisión        | Elegido                      | Descartado                                                         |
| --------------- | ---------------------------- | ------------------------------------------------------------------ |
| Tema            | Solo oscuro                  | Claro/oscuro con switcher                                          |
| Kit del partido | Se elige al crear la lista   | Tocar la camiseta en `/match`; selector fijo arriba de los equipos |
| Colores         | Solo presets                 | Color picker nativo libre                                          |
| Arquitectura    | Sigue local (`localStorage`) | Estado en servidor con URL por partido                             |
| Compartir       | Texto armado a WhatsApp      | Link compartible                                                   |
| Modo dev        | Barra flotante con acciones  | Precarga automática; query param                                   |

Notas sobre lo descartado:

- **Estado en servidor.** Habilitaría mandar un link al grupo y que cada uno marque si va,
  y recién ahí tendrían sentido Server Components y Server Actions. Se descartó porque mete
  base de datos, variables de entorno y configuración de deploy en algo que hoy es estático
  y no falla nunca. El costo no se justifica para un partido de 12 conocidos.
- **PWA instalable / offline.** Fuera de alcance por ahora, decisión explícita.

## 3. Arquitectura

No cambia: Next App Router con todo del lado del cliente, dos stores de zustand persistidos
en `localStorage`. Lo que sí cambia es que el borde del `persist` deja de confiar en el JSON
guardado y pasa a validarlo, porque el modelo de datos se modifica y hay instalaciones con
datos viejos.

## 4. Modelo de datos

### 4.1 Kit del partido

`Colors` se reemplaza por una unión discriminada. Esto hace imposible por construcción tener
colores y pecheras al mismo tiempo, que es justamente la ambigüedad que confundía a la gente:

```ts
interface ShirtsKit {
  mode: "shirts";
  teamA: PresetColor;
  teamB: PresetColor;
}

interface BibsKit {
  mode: "bibs";
  bibTeam: "A" | "B";
}

type Kit = ShirtsKit | BibsKit;
```

Los presets van como mapa, no como enum, y cubren los colores que se usan de verdad en una
cancha: blanco, negro, azul, rojo, verde y amarillo.

### 4.2 Fecha

Hoy `MatchInputs.date` está tipado `Date | null` pero en runtime es un string: sale de un
`input type="datetime-local"` y pasa por `JSON.stringify` al persistirse. El tipo miente.
Pasa a ser un string ISO explícito y se parsea en el punto de render.

### 4.3 Migración

El `persist` de `useMatchStore` suma `version` y `migrate`. Los partidos guardados con
`colors: { teamA, teamB }` se convierten a `{ mode: "shirts", ... }` mapeando cada hex al
preset más cercano. Los datos que no validen contra el schema caen al estado inicial en
lugar de romper la app.

## 5. Bugs a corregir

Todos verificados leyendo el código.

### 5.1 Corrupción de la lista (dos bugs que se combinan)

- `src/utils/index.ts:22` — `uniq()` sobre los nombres ya normalizados descarta en silencio
  a un jugador cuando dos personas distintas se escriben igual. Dos "Mati" en la lista y los
  12 pasan a ser 11.
- `src/hooks/usePlayers.ts:19-20` — `teamA` es `slice(0, half)` y `teamB` es `slice(-half)`.
  Con 11 jugadores `half` es 6, así que el índice 5 queda en los dos equipos. El fix es que
  `teamB` sea `slice(half)`.

Combinados producen un 6 contra 5 con alguien repetido, sin ningún error visible.

### 5.2 Mobile

- `src/components/PlayersList/index.tsx:56` — el menú de tres puntitos es
  `hidden group-hover:block`, y en touch no hay hover. Renombrar, reemplazar y dar de baja
  son inalcanzables desde el celular, que es el dispositivo principal.
- `react-dnd` usa `HTML5Backend`, que no emite eventos touch. El cartel "Arrastra los
  jugadores para ordenar o cambiar de equipo" se muestra en mobile pero la función no existe.
- Las filas de jugadores quedan por debajo de los 44px de alto mínimo.
- `src/app/layout.tsx:33` — `h-screen` provoca el salto de viewport clásico en mobile por la
  barra de direcciones; corresponde `h-dvh`.

### 5.3 Nombres

- `src/utils/index.ts:8` — `replace(/[^a-zA-Z\s]/g, "")` come acentos y ñ: "Martín" queda
  "Martn" e "Iñaki" queda "Iaki". Pasa a `\p{L}` con flag unicode.
- `src/utils/index.ts:40` — `validateName` rechaza los mismos caracteres.
- `src/utils/index.ts:10` — `generatePlayer` parte por el primer espacio y todo lo que sigue
  va a `details`, que se renderiza entre paréntesis. "Fede Camino" queda "Fede (Camino)" y
  "Mati R" queda "Mati (R)" como efecto secundario, no por diseño. El mecanismo resuelve algo
  real (distinguir a los dos Mati), así que se hace explícito en lugar de accidental.

### 5.4 Accesibilidad

- `src/app/layout.tsx:20-21` — `userScalable: false` y `maximumScale: 1` desactivan el pinch
  zoom. Anti-patrón explícito en las guidelines.
- `src/app/layout.tsx:29` — `lang="en"` en una app enteramente en español.
- Botones de solo ícono sin `aria-label`: el de pegar en `ListInput:37` y el submit de
  `WelcomeModal:70`.
- Falta `color-scheme: dark` en el `<html>`, que es lo que corrige scrollbars e inputs
  nativos, y el `theme-color` que matchea el fondo.

### 5.5 Restos y clases muertas

- `src/components/EditModal/index.tsx:31` — `console.log("🚀 ~ data:", data)`.
- `src/components/ToggleSwitch/index.tsx:18` — `dark:bg-gray-8b00`, clase inexistente por typo.
- `src/app/layout.tsx:33` — `maxx-w-1200` (typo de `max-w-`) y `w-95vw`, que en Tailwind v4
  se escribe `w-[95vw]`. Ninguna de las dos aplica nada hoy.
- `src/hooks/useAlert.ts:21` — `@ts-expect-error` para colar `showCancelButton`.
- `src/app/match/page.tsx:45` — `eslint-disable` de `exhaustive-deps` sobre un efecto que
  deriva estado, en lugar de calcularlo.
- `package.json` — `@types/react-datepicker` quedó huérfano cuando se sacó `react-datepicker`
  en el commit 272e30a.
- `src/app/layout.tsx:14` — la descripción dice "compartilos de con tus amigos".

## 6. Cambios de UI

### 6.1 Solo oscuro

Se eliminan `ThemeSwitcher` y `usePrefersColorScheme`, el `@custom-variant dark` de
`globals.css` y las ~40 clases `dark:` duplicadas. `getContrastColor` pierde el parámetro
`isDarkMode` y se queda con la rama oscura.

En lugar de dejar `gray-800` y `gray-700` sueltos por todo el código, se definen tokens
semánticos en `@theme` (superficie, borde, texto). Es lo que hace que el próximo ajuste de
color sea un solo lugar en vez de veinte archivos.

### 6.2 Selector de kit

Componente nuevo `KitSelector`, usado tanto en el formulario de creación como en `EditModal`.
Un segmented control elige el modo, y debajo aparece lo que corresponde: en modo camisetas
una fila de presets por equipo, en modo pecheras qué equipo las usa.

El modo por defecto es camisetas, con blanco para el equipo A y azul para el B, que es lo
que hay hoy. Así el formulario se puede enviar sin tocar el selector y el resultado es el
mismo que antes de este cambio.

En `/match`, el equipo con pecheras se muestra distinto y etiquetado, no solo con otro color.

`ColorPicker` se elimina. El picker nativo en el celular abre la rueda de color del sistema
para elegir entre blanco y azul, que es demasiada ceremonia para la decisión que es.

El textarea de la lista hoy mide 400px para una lista de 12 líneas y queda medio vacío, así
que se achica y el selector entra sin que el formulario crezca.

### 6.3 Pegado inteligente

Hoy el botón de pegar mete el portapapeles crudo en el textarea. Lo que se copia de WhatsApp
es el mensaje completo, con las líneas de horario y cancha incluidas, y esas dos líneas se
convertirían en jugadores llamados "Miércoles hrs" y "Cancha Quintana y Salta".

El parser pasa a separar las líneas de jugadores de los metadatos, y llena fecha y lugar con
lo que encuentra. Un pegado y el formulario queda completo.

### 6.4 Compartir

Texto armado en el formato que ya usa el grupo, con los emojis, vía `navigator.share()` y
fallback a portapapeles. Reemplaza el screenshot.

### 6.5 Lista habitual

Guardar la lista de siempre y reusarla de un toque, que es lo que ahorra tiempo cada semana.

Vive en su propia clave de `localStorage`, separada del partido en curso, porque sobrevive a
`resetMatch()`. Guarda los nombres, el lugar y el horario, no las bajas ni los reemplazos de
un partido puntual. En el formulario de creación aparece como un botón solo si hay algo
guardado, y desde `/match` se puede guardar la lista actual como habitual.

### 6.6 Drag en touch

Dos cambios complementarios. El menú de tres puntitos suma "Cambiar de equipo" y "Subir" /
"Bajar", que funcionan en cualquier dispositivo y son la alternativa por tap que las
guidelines exigen para cualquier gesto. Y el drag migra de `react-dnd` a `@dnd-kit`, que
maneja punteros, touch y teclado con un solo set de sensores, reemplazando dos dependencias
por una.

## 7. Barra flotante de dev

Solo se renderiza bajo `NODE_ENV === "development"`, así que el chequeo la saca del bundle de
producción. Colapsable, anclada abajo. Acciones:

- Cargar la lista habitual: los 12 jugadores, Quintana y Salta, y el próximo miércoles 18:30
  ya resuelto.
- Cargar una lista impar de 11, para verificar el fix del split.
- Cargar una lista con nombres repetidos, para verificar el fix de `uniq`.
- Saltar directo a `/match`.
- Resetear los dos stores.
- Simular un partido ya vencido, para probar ese alert.

El fixture vive en su propio archivo y es la misma data que usan los tests.

## 8. Deuda de código

### 8.1 Dependencias que se van

- `lodash` y `@types/lodash`, que están por tres funciones: `uniq` es `[...new Set()]`,
  `shuffle` son cinco líneas, y `uniqueId` es el que causa el bug de las keys porque es un
  contador de módulo que arranca de cero en cada carga. Pasa a `crypto.randomUUID()`.
- `sweetalert2` y `sweetalert2-react-content`, que renderizan fuera de React, obligan al
  `@ts-expect-error` y duplican el design system en strings de `customClass`.
- `framer-motion`, que sostiene un solo `motion.path` en el `Logo`, resoluble con CSS.
- `react-laag`, que sostiene un solo menú. Headless UI v2 ya trae el posicionamiento.
- `react-dnd` y `react-dnd-html5-backend`, reemplazados por `@dnd-kit`.

### 8.2 Keys

`src/components/PlayersList/index.tsx:40` usa `key={uniqueId(...)}`, que genera una key nueva
en cada render y hace que React desmonte y remonte la lista entera cada vez. Pasa a
`player.id`.

### 8.3 Límites entre componentes

- `DateInput` tiene `UseFormRegister<MatchInputs>` hardcodeado en su interface, así que no se
  puede usar en ningún otro formulario. Lo mismo `TextInput` y `ListInput`, que reciben
  `register` como prop. Un input no debería saber que existe react-hook-form ni cuál es el
  tipo del formulario que lo contiene: pasan a aceptar props de input estándar.
- `usePlayers` parece un hook de datos pero adentro llama a `useAlert` y abre prompts. La
  lógica de qué le pasa a los datos queda enredada con cómo se le pregunta al usuario, y eso
  hace que ninguna de las dos cosas sea testeable por separado. Se separan.
- `variant?: "outline-solid"` como unión de un solo valor es el smell de prop booleana. Las
  variantes de `Button` y `TextInput` pasan a `cva`.

### 8.4 Validación

`zod` en el borde del `persist`, que es lo que permite la migración del punto 4.3 sin que un
`localStorage` viejo rompa la app.

### 8.5 Toolchain

`@headlessui/react` v1 no soporta React 19 oficialmente, así que v2. ESLint 8 está EOL y
`next lint` quedó deprecado. Next 15.4.6 a 16 con el codemod oficial.

Esta parte es la más ruidosa y no aporta nada visible, así que va última y en commits
separados: si molesta, se descarta sin tocar el resto.

## 9. Testing

No hay ningún test hoy, y los dos bugs de la sección 5.1 son exactamente los que un test
hubiera cazado. Vitest, cubriendo la lógica que vale la pena:

- `generatePlayers`: nombres repetidos, acentos y ñ, numeración de la lista, líneas vacías,
  y el mensaje completo de WhatsApp con horario y cancha.
- El split de equipos: par, impar, y que nadie aparezca dos veces.
- La migración del store: `colors` viejo a `Kit`, y JSON inválido al estado inicial.
- `getContrastColor` y el armado del texto para compartir.

## 10. Fases

Ordenadas de menor a mayor riesgo, cada una entregable por separado.

| #   | Fase                              | Contenido                                                 |
| --- | --------------------------------- | --------------------------------------------------------- |
| 1   | Tests y corrección                | Vitest, tests que reproducen los bugs de 5.1, y sus fixes |
| 2   | Mobile y accesibilidad            | 5.2 (menos el drag), 5.4, 5.5                             |
| 3   | Solo oscuro                       | 6.1 y tokens semánticos                                   |
| 4   | Kit                               | Modelo de datos, `KitSelector`, migración con zod         |
| 5   | Barra de dev                      | Sección 7                                                 |
| 6   | Pegado, compartir, lista habitual | 6.3, 6.4, 6.5                                             |
| 7   | Dieta de dependencias             | 8.1, 8.3, y `cva`                                         |
| 8   | Toolchain                         | 8.5 y la migración a `@dnd-kit` de 6.6                    |

## 11. Fuera de alcance

- Estado en servidor, URL por partido, y que cada jugador marque si va.
- PWA instalable y funcionamiento offline.
- Historial de partidos más allá del `MatchHistory` que ya existe.
- Cualquier cosa de estadísticas, rankings o balanceo por nivel de los jugadores.
