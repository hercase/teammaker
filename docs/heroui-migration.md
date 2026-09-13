# Migración a HeroUI v3 — hecha

Plan para reemplazar nuestros componentes visuales por [HeroUI v3](https://heroui.com/en/docs/react/components),
manteniendo el violeta de marca.

Todo lo que sigue está verificado contra la documentación y contra `npm view`, no de memoria.

## Resultado

Las seis fases están hechas. 28 de 28 comprobaciones en navegador pasan, `yarn run check` limpio,
`yarn build` compila. El costo real: `/match` pasó de 175 kB a 229 kB de primera carga, que es lo que
pesa React Aria.

Dos decisiones que se apartaron del plan, con su motivo:

- **La fecha sigue siendo un `datetime-local` nativo** dentro del `TextField` de HeroUI, no su
  `DatePicker`. En el teléfono el nativo abre la rueda del sistema y da el teclado correcto; cambiarlo
  por un calendario más lindo sería una regresión justo donde se usa la app.
- **El menú de fila cuelga del ⋮, no de la fila entera.** React Aria lee el final de un arrastre como
  una pulsación, así que arrastrar un jugador abría el menú. Una gesta por superficie.

## Lo que ya está hecho

- `@heroui/react@3.2.5` y `@heroui/styles@3.2.5` instalados.
- `@import "@heroui/styles";` agregado en `globals.css`, inmediatamente después de `@import "tailwindcss";`
  (el orden importa: Tailwind primero).
- `data-theme="dark"` en `<html>`. HeroUI selecciona el tema oscuro con `.dark` o `[data-theme="dark"]`,
  y esta app no tiene variante clara a la que alternar.
- `.mcp.json` con el servidor `@heroui/react-mcp`, para que las próximas sesiones consulten la API real.

Con eso solo, la app sigue andando igual: cero violaciones de contraste en las dos pantallas.

## Por qué es viable

| | requisito | tenemos |
|---|---|---|
| React | `>=19.0.0` | 19 |
| Tailwind | `>=4.0.0` | 4 |
| Provider | **no hace falta** en v3 | — |

HeroUI v3 no necesita envolver la app en un provider: alcanza con importar los estilos.
Por debajo usa React Aria Components, que es la implementación de accesibilidad de Adobe.

## El tema: el export del theme builder, con nuestro violeta

El plan original decía lo contrario — mapear nuestra paleta a los roles de HeroUI — y así se hizo
primero. El resultado fue que la app quedó **igual que antes**: si los componentes de la librería se
dibujan sobre nuestros grises, no se ve nada de la librería.

El segundo intento fue al revés pero a medias: se seteó `--accent` solo y todo lo demás quedó en el
default de HeroUI, con lo cual los neutros seguían tintados hacia *su* hue y nunca hacia el nuestro.

Lo que quedó es el export del theme builder entero, en un solo bloque `[data-theme="dark"]`, con dos
números: el hue 293.76, que es `#7039d0` medido en OKLCH, y ese mismo violeta como accent. Todos los
neutros llevan una traza de él (0.0088 de croma, 0.0176 en las superficies), así que los grises son
de la marca y no un zinc genérico.

Esto trae variables que antes no existían y que son las que se ven: `--field-background`,
`--field-border: transparent`, `--field-radius`, `--surface-secondary` / `--surface-tertiary`,
`--segment`, `--separator`, `--radius`.

Nuestros tokens son alias de los suyos, para que lo que dibujamos a mano — los paneles de equipo, las
filas de jugador, el selector de kit — se apoye en el mismo suelo que su Button y su Modal.

Dos desviaciones del export, las dos con motivo:

- `--danger` apunta a nuestro rosa en vez del rojo anaranjado del builder, porque el rosa ya
  significa "se fue" en la lista y en el historial, y un botón destructivo en otro rojo habría sido
  la app diciendo lo mismo en dos colores.
- `--field-background` sube un escalón, de `--surface` a `--surface-secondary`. El builder los deja
  idénticos, que funciona donde sus propias demos ponen los campos: sobre la página. Esta app pone
  tres adentro del diálogo Editar, cuyo cuerpo es `--surface` — medido, campo y diálogo daban
  1.00:1, así que los recuadros no estaban tenues, no estaban. Ahora dan 1.12:1, que es la
  separación normal entre dos superficies oscuras.

Lo que **no** entra en el tema y sigue siendo nuestro, porque no son colores de interfaz sino objetos
reales: los seis colores de camiseta, el naranja de la pechera y el contorno de la oscura. Viven en
`src/utils/kit.ts` y ahí se quedan.

### La trampa que hizo que nada de esto se viera

Durante mucho tiempo los campos no se parecían a los de HeroUI y parecía que faltaba configuración.
No faltaba: `globals.css` definía `@utility input` y `@utility label`, y HeroUI dibuja su Input y su
Label con `class="input"` y `class="label"`. Una utility de Tailwind con ese nombre no es algo a lo
que la app opta — cae sobre los mismos elementos y gana. Los campos se estaban repintando con el
relleno equivocado, un borde que HeroUI no pide y el radio equivocado, y era invisible en el código
porque ningún componente escribía nunca `className="input"`. El TextArea fue la pista: no choca con
nada y era el único campo que se veía bien.

## Componente por componente

| nuestro | líneas | pasa a | qué ganamos |
|---|---|---|---|
| `Button` | 63 | `Button` | variantes, estados de carga, `ButtonGroup` |
| `TextInput` | 54 | `TextField` | label, descripción y error como una sola pieza validada |
| `DateInput` | 53 | `TextField` + input nativo | el campo de HeroUI, la rueda del sistema |
| `ToggleSwitch` | 32 | `Switch` | — (borra `@headlessui/react`) |
| `ConfirmDialog` | 96 | `AlertDialog` | es literalmente su caso de uso |
| `EditModal` | 134 | `Modal` | foco, scroll lock y escape resueltos |
| `FloatingMenu` | 134 | `Dropdown` | **borra el manejo de foco que escribimos a mano** y `react-laag` |
| `Toast` | 39 | `Toast` | apilado y auto-dismiss |
| `Spinner` | 23 | `Spinner` | — |
| `InfoCard` | 41 | `Card` | — |

Se quedan como están, porque son la app y no widgets genéricos:
`PlayersList`, `PlayerName`, `KitSelector`, `MatchHistory`, `MatchSummary`, `ShareCard`, `Logo`, `Icons`,
`CreateMatchForm`, `DevBar`. Van a heredar el tema igual, porque usan los tokens.

## Dependencias que se van

- `@headlessui/react` — lo usaban `ToggleSwitch`, `ConfirmDialog` y `EditModal`.
- `react-laag` — sostenía un solo menú, el de la fila de jugador.

`react-dnd` **se queda**. La documentación de HeroUI no expone drag and drop en `ListBox`, así que no
lo cuento como resuelto. Sigue pendiente que arrastrar jugadores solo funcione en escritorio.

## Fases

Cada fase se termina con `yarn run check`, captura y medición de contraste antes de pasar a la siguiente.

1. **Tema.** Escribir el bloque de arriba y comprobar que nada se movió. Sin tocar componentes.
2. **Botones.** `Button` es lo más usado y lo menos riesgoso. Si acá algo no cierra, se descarta barato.
3. **Formulario.** `TextField` y `Switch`. Hay que verificar que `react-hook-form` siga registrando bien.
4. **Superposiciones.** `AlertDialog`, `Modal`, `Dropdown`, `Toast`. Es la fase con más ganancia — el menú
   de fila nos costó manejo de foco propio esta sesión — y la de más riesgo, porque toca el reemplazo y la
   baja de jugadores.
5. **Fecha.** `DatePicker`. Va última y separada: hoy el input nativo aporta el teclado correcto en el
   teléfono y esa regresión sería peor que el problema que resuelve.
6. **Limpieza.** Sacar `@headlessui/react` y `react-laag`, y volver a medir el bundle.

## Riesgos, dichos de frente

- **HeroUI v3 es nuevo.** El paquete existe desde enero de 2025 y v3 salió este año. Está mantenido
  (última publicación de septiembre de 2026), pero no tiene los años de rodaje de Headless UI.
- **La imagen compartida.** `snapdom` clona el DOM y copia estilos calculados. HeroUI usa variables CSS,
  así que debería funcionar igual, pero hay que volver a generar la imagen después de cada fase.
- **El peso.** Hoy `/match` está en 175 kB de primera carga. Hay que medirlo en la fase 2 y decidir
  con el número, no con la expectativa.
- **`react-hook-form`.** Fue el riesgo más caro, y no por el `register`: eso se resolvió sin
  `Controller`, poniéndolo en el `Input`/`TextArea` interno en vez de en el `TextField`. Lo que
  costó es que React Aria guarda el valor en su propio estado y lo escribe en el DOM en cada
  render, mientras que `setValue` asigna `node.value` sin disparar ningún evento. Todo lo que la
  app escribía desde el código se borraba en el render siguiente, en silencio: la X dejaba el
  nombre viejo, Pegar llenaba el formulario y dejaba el cuadro vacío, y Editar abría con los tres
  campos en blanco. `defaultValue` parecía la solución y solo cubría el primer render; lo correcto
  es pasarle `value` al `TextField` en cada render. La otra, `validationBehavior="aria"`: con la
  nativa el browser bloquea el submit antes de que corra react-hook-form.

## Lo que no cambia

El modelo de nombres, el `Kit`, la persistencia, la imagen compartida, el parser pendiente y las
decisiones de producto están en [`CLAUDE.md`](../CLAUDE.md). Esta migración es de vestido, no de cuerpo.
