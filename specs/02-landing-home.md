# SPEC 02 — Landing page de Arcade Vault

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-07
> **Objetivo:** Portar la landing page de `references/templates/home-about/home.jsx` a Next 16 como nueva portada del sitio, desplazando la biblioteca a `/games` y añadiendo el enlace `Inicio` a la navegación.

## Por qué existe esta spec

SPEC 01 portó las cinco pantallas del prototipo original y dejó la biblioteca en `/`. Después llegó una tanda nueva de plantillas, `references/templates/home-about/`, con dos pantallas que el proyecto no tiene: una **landing page** (`home.jsx`) y un **Acerca de** (`about.jsx`), más un `nav.jsx` que añade los enlaces `Inicio` y `Acerca de` y apunta el logo a Inicio.

Esa tanda es la nueva fuente de verdad visual para esas pantallas. Esta spec porta **solo la landing**. El Acerca de va en su propia spec, porque arrastra dos bloques de CSS (`GAMEPAD` y `Theme variants`, unas 470 líneas) que la landing no usa.

## Alcance

**Dentro:**

- Nueva portada en `/` con las seis secciones de `home.jsx`: hero, `// 01` por qué Arcade Vault, `// 02` juegos disponibles, franja de estadísticas, `// 03` actividad en vivo, `// 04` precios y CTA final.
- Traslado de la biblioteca de `/` a `/games`, con todos los enlaces internos actualizados.
- Enlace `Inicio` en la navegación de escritorio y en el panel móvil, y logo apuntando a `/`.
- Port de los tres bloques de CSS que la landing necesita (`HOME PAGE`, `ACTIVITY`, `PRICING`) a `app/globals.css`.
- Datos de escaparate de las secciones de actividad y estadísticas, en `app/data.ts`.

**Fuera de alcance (para futuras specs):**

- La pantalla **Acerca de** (`about.jsx`) y su enlace en la navegación, junto con los bloques CSS `GAMEPAD` y `Theme variants`.
- Actividad real. El ticker de últimas puntuaciones y el top de jugadores son datos fijos, no consultas.
- Backend, base de datos y autenticación real: siguen fuera, como en SPEC 01.
- Tests. El repositorio sigue sin framework de tests.
- Redirección permanente de `/` a `/games` para enlaces antiguos: el proyecto no está publicado, no hay enlaces que preservar.
- Renombrar `/juegos/[id]` a `/games/[id]`. El detalle y el reproductor se quedan donde están; unificar el idioma de las rutas es otra spec.

## Mapa de rutas

| Ruta | Antes (SPEC 01) | Después |
| --- | --- | --- |
| `/` | Biblioteca | **Landing** |
| `/games` | — | **Biblioteca** |
| `/juegos/[id]` | Detalle | sin cambios |
| `/juegos/[id]/jugar` | Reproductor | sin cambios |
| `/salon` | Salón de la fama | sin cambios |
| `/auth` | Autenticación | sin cambios |

El logo de la navegación pasa a apuntar a `/`, como en `home-about/nav.jsx:12`. Los siete enlaces que hoy significan "volver a la biblioteca" pasan a `/games`:

`components/nav.tsx:23,30,70`, `components/auth-form.tsx:23,28`, `components/game-detail-actions.tsx:16`, `components/game-player.tsx:152`, `components/hall-of-fame.tsx:109` y `app/not-found.tsx:34`.

La ruta de la biblioteca queda en inglés (`/games`) mientras el detalle sigue en español (`/juegos/[id]`). Es una inconsistencia consciente: la decide el usuario y unificar el idioma de las rutas obligaría a mover también detalle y reproductor, que esta spec no toca.

## Estrategia de estilos

Se mantiene la regla de SPEC 01: `app/globals.css` es la capa de tema, Tailwind la capa de composición.

`app/globals.css` replica `references/templates/styles.css` sección a sección y en el mismo orden. Esa correspondencia se conserva: los bloques nuevos se anexan al final, con su mismo comentario de cabecera y sin reescribirse a utilidades.

| Bloque en `home-about/styles.css` | Líneas | Clases |
| --- | --- | --- |
| `/* ===== HOME PAGE ===== */` | 930–1070 | `.home`, `.home-hero`, `.home-hero-inner`, `.hero-eyebrow`, `.home-title`, `.home-sub`, `.home-ctas`, `.hero-scroll`, `.home-silos`, `.silo`, `.home-section`, `.section-head`, `.section-title`, `.section-rule`, `.kicker`, `.feature-grid`, `.feature-card`, `.ft-icon`, `.ft-title`, `.ft-desc`, `.mini-rail`, `.mini-card`, `.mini-cover`, `.mini-meta`, `.mini-title`, `.mini-cat`, `.home-stats`, `.stats-inner`, `.stat-block`, `.stat-n`, `.stat-u`, `.stat-s`, `.home-final`, `.final-title`, `.final-cta`, `.final-tag`, `.reveal` |
| `/* ===== ACTIVITY ===== */` | 1621–1671 | `.activity-grid`, `.activity-card`, `.ac-head`, `.ac-title`, `.live-led`, `.ticker`, `.tick-row`, `.tk-p`, `.tk-mid`, `.tk-s`, `.tk-t`, `.lb-link`, `.top-list`, `.top-row`, `.top1`, `.top2`, `.top3`, `.tp-rk`, `.tp-bar`, `.tp-fill`, `.tp-p`, `.tp-s` |
| `/* ===== PRICING ===== */` | 1672–~1740 | `.pricing-grid`, `.price-card`, `.pc-label`, `.pc-name`, `.pc-amount`, `.pc-amount-n`, `.pc-amount-u`, `.pc-tag`, `.pc-list`, `.pc-foot`, `.pc-stamp`, `.pricing-faq`, `.faq-item`, `.faq-q`, `.faq-a` |

De la cola del bloque `PRICING` se omiten las clases genéricas que **ya existen** en `app/globals.css`: `.fade-in`, `.slide-in`, `.spinner`, `.tw-label`, `.tw-section`.

No hacen falta tokens nuevos: el CSS portado usa solo variables ya declaradas (`--cyan`, `--magenta`, `--yellow`, `--green`, `--ink-dim`, `--ink-faint`, `--bg-2`, `--line`, `--pixel`, `--mono`). **No se toca `:root` ni el bloque `@theme inline`**, y no se crea `tailwind.config.js`.

## Modelo de datos

El mini-rail de la sección `// 02` sale de `GAMES` (`GAMES.slice(0, 6)`), igual que en la plantilla. Las secciones `// 03` y la franja de estadísticas traen datos inventados en la plantilla; se llevan a `app/data.ts` en vez de incrustarlos en el componente, porque `app/data.ts` es el sustituto de la base de datos y es donde vivirán cuando exista.

Tipos nuevos en `app/types.ts`:

```ts
export interface TickerEntry {
  player: string;
  game: string;
  score: number;
  when: string;   // relativo y fijo, p. ej. "hace 2 min"
  color: GameColor;
}

export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

export interface HomeStat {
  n: string;      // "12+", "MILES", "GLOBAL"
  unit: string;
  sub: string;
}
```

Constantes nuevas en `app/data.ts`, con los mismos literales de `home.jsx`:

- `RECENT_SCORES: TickerEntry[]` — 7 filas, de `NEONFOX` a `CYBER_LU`.
- `TOP_PLAYERS: TopPlayer[]` — 5 filas, rangos 1 a 5.
- `HOME_STATS: HomeStat[]` — 3 bloques: `12+ JUEGOS`, `MILES DE PARTIDAS`, `GLOBAL RANKING`.

Las tres son datos de escaparate: no derivan de `GAMES` ni de `seededScores` y no cambian con el tiempo. Queda anotado en el comentario de cabecera del módulo, junto a la nota que ya existe.

## Plan de implementación

Cada paso deja la aplicación compilando (`npm run build`).

1. Mover `app/page.tsx` a `app/games/page.tsx` y actualizar los siete enlaces listados en el mapa de rutas. En `components/nav.tsx`, `isLibrary` pasa a `pathname === "/games" || pathname.startsWith("/juegos")`. Prueba manual: `/games` renderiza la biblioteca y ningún botón "volver" queda roto; `/` da 404 de momento.
2. Añadir el enlace `Inicio` a `components/nav.tsx`, antes de `Biblioteca`, en el menú de escritorio y en el panel móvil, con `isHome = pathname === "/"`. El logo apunta a `/`. **No** se añade `Acerca de`. Prueba manual: el enlace aparece en ambos menús y navega a `/`.
3. Anexar a `app/globals.css` los tres bloques de CSS de la tabla anterior. Prueba manual: `npm run dev` levanta y las cinco pantallas de SPEC 01 no cambian de aspecto.
4. Añadir los tres tipos a `app/types.ts` y las tres constantes a `app/data.ts`. Prueba manual: `npm run build` compila.
5. Crear `components/use-reveal.ts` con el hook `useReveal` de la plantilla: observa los `.reveal`, les añade `.in` al entrar en viewport con `threshold: 0.12`, hace `unobserve` de cada uno y `disconnect` al desmontar. Prueba manual: aún no se ve nada, el build compila.
6. Crear `components/home-silhouettes.tsx` con las ocho siluetas SVG (`s1` a `s8`) y `components/feature-icon.tsx` con los cuatro iconos pixel, tipando `kind` como unión (`"GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"`) en vez del `string` de la plantilla. Prueba manual: el build compila.
7. Crear `components/home.tsx` (`"use client"`, necesita `IntersectionObserver`) con el hero, la sección `// 01` y la `// 02`. Sustituir `app/page.tsx` por la landing. Prueba manual: `/` muestra hero, features y mini-rail; una minicard navega a `/juegos/<id>`.
8. Añadir a `components/home.tsx` la franja de estadísticas y la sección `// 03` de actividad, leyendo `HOME_STATS`, `RECENT_SCORES` y `TOP_PLAYERS`. Prueba manual: ticker de 7 filas y top de 5 con barra decreciente; "VER SALÓN →" lleva a `/salon`.
9. Añadir la sección `// 04` de precios y el CTA final. Prueba manual: la tarjeta `$0` con sello FREE PLAY, las tres FAQ, "EMPEZAR GRATIS" a `/auth` y "INSERTAR MONEDA →" a `/games`.
10. Añadir `export const metadata` en `app/games/page.tsx` con el título `Biblioteca · Arcade Vault`, para que la portada conserve el título genérico del layout. Prueba manual: la pestaña del navegador cambia entre `/` y `/games`.
11. Comparación visual contra la plantilla siguiendo el procedimiento de `CLAUDE.md`: copiar `references/templates/home-about/*` a `public/__ref/`, abrirla junto a `http://localhost:3000/`, capturar escritorio y móvil en `.playwright-mcp/` y **borrar `public/__ref/`** al terminar.

## Detalles de comportamiento a replicar

- **Navegación.** Los `navigate({...})` de la plantilla se traducen a rutas: `biblioteca` → `/games`, `auth` → `/auth`, `salon` → `/salon`, `detalle` → `/juegos/${id}`. Los CTA son `<Link>` con las clases `.btn` correspondientes, como ya hace `components/nav.tsx:52` con "Iniciar Sesión", no `<button onClick={router.push}>`.
- **Retardos escalonados.** Las tarjetas de feature usan `transitionDelay: (i * 80) + "ms"` y los bloques de estadística `(i * 90) + "ms"`; las filas del ticker, `animationDelay: (i * 60) + "ms"`. Son valores calculados en runtime, así que el atributo `style` está permitido aquí por la misma excepción que SPEC 01 concede al salón y al tilt de las tarjetas.
- **Barra del top.** El ancho de `.tp-fill` es `(100 - i * 16) + "%"`, no proporcional a la puntuación.
- **Números.** Se formatean con `formatScore` de `app/data.ts`, que ya envuelve `toLocaleString("es-ES")`, en lugar de repetir la llamada como hace la plantilla.
- **Textos.** En español, literales de la plantilla, sin reescribir.
- **Siluetas y adornos.** `.home-silos`, `.hero-scroll` y el sello `.pc-stamp` son decorativos y van con `aria-hidden="true"` cuando la plantilla ya lo hace.
- **`MiniCard`** recibe un `Game` tipado y usa `game.cover` como clase, igual que `components/game-card.tsx`. No lleva el tilt 3D de las tarjetas de la biblioteca.

## Criterios de aceptación

- [ x] `npm run build` y `npm run lint` terminan sin errores ni warnings.
- [ x] `/` muestra la landing: hero con el título en tres líneas (blanco, cian, magenta), siluetas de fondo y dos CTA.
- [ x] Al hacer scroll cada sección aparece con la transición `.reveal.in`; al recargar arriba vuelven a estar ocultas.
- [ x] La sección `// 01` muestra cuatro tarjetas de feature con su icono y su color: cyan, yellow, magenta y green.
- [ x] La sección `// 02` muestra seis minicards; al pulsar una se navega a `/juegos/<id>`.
- [ x] "VER TODOS LOS JUEGOS →" lleva a `/games`.
- [ x] La sección `// 03` muestra siete filas de ticker y cinco de top jugadores, con la barra `.tp-fill` decreciente y las tres primeras filas destacadas.
- [ x] "VER SALÓN →" lleva a `/salon`.
- [ x] La sección `// 04` muestra la tarjeta de precio `$0 / SIEMPRE` con sus seis viñetas, el sello FREE PLAY y las tres FAQ.
- [ x] "EMPEZAR GRATIS →" y "✦ CREAR CUENTA" llevan a `/auth`.
- [ x] "INSERTAR MONEDA →" y "▶ EXPLORAR JUEGOS" llevan a `/games`.
- [ x] La navegación marca `Inicio` activo en `/` y `Biblioteca` activo en `/games` y en `/juegos/*`. El panel móvil se comporta igual.
- [ x] El logo de la navegación lleva a `/`.
- [ x] `/games`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon`, `/auth` y el 404 siguen funcionando, y ningún botón "volver" apunta a `/`.
- [ x] A 375 px de ancho ninguna sección desborda horizontalmente.
- [ x] No hay advertencias de hidratación en la consola en la portada.
- [ x] El ticker, el top de jugadores y las estadísticas salen de `app/data.ts`; ningún dato queda incrustado en `components/home.tsx`.
- [ x] Comparada contra `references/templates/home-about/arcade-vault-standalone.html`, la portada coincide en fondo, tipografías, neones y espaciado en escritorio y en móvil.
- [ x] No existe `tailwind.config.js`, no se añadió ninguna hoja de estilos aparte de `app/globals.css` y no se añadió ninguna dependencia.

## Decisiones

- **Sí:** la landing va en `/` y la biblioteca se mueve a `/games`. Es lo que hace `home-about/nav.jsx`, donde el logo apunta a Inicio y `Biblioteca` es un enlace más del menú. El nombre `/games` lo fijó el usuario.
- **No:** dejar la landing en `/inicio` con la biblioteca en `/`. Sería el cambio más barato, pero deja el logo apuntando a la biblioteca y se aparta de la plantilla justo en la pantalla que esta spec porta.
- **No:** llamarla `/biblioteca`. Habría casado con el idioma de `/juegos` y de la interfaz, pero el usuario eligió `/games`.
- **No:** renombrar de paso `/juegos/[id]` a `/games/[id]`. Ampliaría el alcance a detalle y reproductor; unificar el idioma de las rutas va en su propia spec.
- **No:** redirección de `/` a `/games`. El proyecto no está publicado; no hay enlaces antiguos que preservar.
- **Sí:** portar solo la landing. El Acerca de arrastra unas 470 líneas de CSS de gamepad y sus variantes de tema, que la landing no usa; mezclarlos haría la spec el doble de grande sin necesidad.
- **Sí:** el CSS nuevo se anexa tal cual a `app/globals.css`. El archivo replica `styles.css` sección a sección; romper esa correspondencia dificultaría las comparaciones futuras contra las plantillas.
- **No:** reescribir el CSS de la landing a utilidades de Tailwind. Es arte de tema —gradientes recortados a texto, `drop-shadow` de neón, siluetas absolutas—, justo lo que SPEC 01 decidió dejar en `globals.css`.
- **Sí:** ticker, top y estadísticas en `app/data.ts`. Es el sustituto de la base de datos: cuando la actividad sea real, se cambia ese módulo y `components/home.tsx` no se toca.
- **No:** derivar el ticker de `GAMES` y `seededScores`. Los nombres de juego de la plantilla ya coinciden con `GAMES`, pero calcularlos añadiría código para inventar los mismos datos fijos con menos control sobre el texto.
- **Sí:** `formatScore` en vez de `toLocaleString("es-ES")` repetido. Misma razón que en SPEC 01: evita que el mismo número se formatee distinto en servidor y en cliente.
- **Sí:** `components/home.tsx` es cliente. `useReveal` necesita `IntersectionObserver`, que solo existe en el navegador.
- **No:** animar la aparición de secciones solo con CSS. `.reveal` depende de que algo añada `.in`; sin observador, o todo se ve desde el principio o nada se ve nunca.
- **Sí:** trocear la landing en `home.tsx`, `home-silhouettes.tsx`, `feature-icon.tsx` y `use-reveal.ts`. `home.jsx` son 338 líneas, la mitad SVG; separarlas deja la composición legible, como ya se hizo con `game-placeholder.tsx`.
- **Sí:** `kind` de `FeatureIcon` tipado como unión. El proyecto está en TypeScript `strict`; un `string` deja pasar iconos inexistentes que la plantilla resuelve devolviendo `null`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Mover `/` a `/games` deja enlaces "volver" rotos en cinco componentes y en el 404. | El paso 1 los cambia todos de golpe y el criterio de aceptación los comprueba uno a uno. |
| Convivir `/games` en inglés con `/juegos/[id]` en español confunde al leer las rutas. | Queda anotado en el mapa de rutas como decisión consciente. Unificarlo es una spec aparte que moverá también detalle y reproductor. |
| El CSS nuevo trae nombres genéricos (`.section-title`, `.kicker`, `.ticker`) que podrían chocar con clases ya presentes en `app/globals.css`. | Antes de anexar, comprobar cada nombre con una búsqueda en `app/globals.css`. Las clases genéricas repetidas al final del bloque `PRICING` ya están identificadas y se omiten. |
| `toLocaleString("es-ES")` en un componente cliente puede diferir del render de servidor y provocar desajuste de hidratación. | Se usa `formatScore`, y la landing entera es cliente, así que esos números no se renderizan dos veces con motores distintos. |
| `IntersectionObserver` no dispara si el contenido cabe entero en pantalla o si el navegador no lo soporta, dejando las secciones invisibles para siempre. | El hook solo añade `.in`; si nada lo añade, el contenido queda a `opacity: 0`. Se comprueba en el criterio de scroll y, de fallar, se degrada haciendo visible `.reveal` por defecto. |
| La franja de estadísticas dice `12+ JUEGOS` pero `GAMES` tiene 8 entradas. | Es texto de escaparate de la plantilla, se porta literal. Queda anotado aquí; corregirlo es una decisión de contenido, no de esta spec. |
| El mini-rail muestra `GAMES.slice(0, 6)` sin criterio de orden. | Defecto heredado de la plantilla. Se replica a propósito; ordenar por popularidad va en otra spec. |

## Lo que **no** entra en esta spec

- La pantalla Acerca de, su enlace de navegación y los bloques CSS `GAMEPAD` y `Theme variants`.
- Actividad en vivo real: el ticker y el top de jugadores siguen siendo datos fijos.
- Backend, base de datos y autenticación real.
- Puntuaciones reales persistidas y leídas.
- Renombrar `/juegos/[id]` y `/juegos/[id]/jugar` para unificar el idioma de las rutas.
- Tests automatizados.
- Redirección de `/` a `/games`.

Cada uno de esos puntos, si entra, va en su propia spec.
