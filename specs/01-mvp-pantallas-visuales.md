# SPEC 01 — MVP visual de las pantallas de Arcade Vault

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-09-06
> **Objetivo:** Portar las cinco pantallas del prototipo de `references/templates/` a Next 16 App Router como MVP puramente visual, sin ningún juego real.

## Por qué existe esta spec

El repositorio es todavía el scaffold de `create-next-app`. Lo único hecho es el tema global: `app/globals.css` contiene íntegro el CSS de `references/templates/styles.css` y `app/layout.tsx` sirve Press Start 2P, JetBrains Mono y Courier Prime vía `next/font/google`.

Existe un prototipo React 18 UMD completo en `references/templates/` con cinco pantallas y ocho componentes. Ese prototipo es la fuente de verdad del diseño. Esta spec lo convierte en una aplicación Next 16 real, sin añadir funcionalidad que el prototipo no tenga.

## Alcance

**Dentro:**

- Cinco pantallas: biblioteca, detalle de juego, reproductor, autenticación y salón de la fama.
- Chrome compartido en el layout raíz: `Nav` sticky con panel móvil y footer.
- Datos mock portados a TypeScript: 8 juegos, 5 categorías y el generador determinista de puntuaciones.
- Sesión falsa persistida en `localStorage`, sin backend ni validación.
- Reproductor con la simulación decorativa del prototipo: arena CSS, HUD, puntuación que sube y modal de fin de partida.

**Fuera de alcance (para futuras specs):**

- Cualquier juego jugable. La arena es arte CSS animado por keyframes. No hay bucle de juego, ni input de teclado, ni colisiones.
- Backend, base de datos, API routes y autenticación real.
- Puntuaciones reales. Los leaderboards se siguen generando con `seededScores`.
- Tests. El repositorio no tiene framework de tests configurado.

## Estrategia de estilos

Regla: **`app/globals.css` es la capa de tema; Tailwind es la capa de composición.**

- El CSS ya migrado en `app/globals.css` se mantiene y se usa para lo que ya resuelve: efectos y arte que no se expresan bien como utilidades — `.av-bg`, `.av-noise`, `.btn`, `.card`, `.crt`, `.cover-*`, `.game-arena`, `.podium-slot`, `.lb-row`, animaciones y keyframes.
- Todo lo demás se escribe con **utilidades de Tailwind** en el JSX: layout, grid, flex, espaciado, tamaños, responsive y estados de hover simples.
- Los tokens del tema ya están expuestos como utilidades en el bloque `@theme inline` de `app/globals.css`, así que en el JSX se escribe `bg-bg-2`, `text-ink-dim`, `border-line`, `font-pixel`, etc. Nada de valores hex sueltos en el markup.
- Se puede **modificar `app/globals.css`** cuando haga falta: añadir un token que falte, corregir una regla o borrar una clase que Tailwind ya cubre. Lo que no se hace es escribir CSS nuevo para algo que una utilidad resuelve.
- No se crea ningún `tailwind.config.js`. La configuración es CSS-first, en `app/globals.css`.

## Mapa de rutas

El prototipo guarda la ruta como objeto JSON en `location.hash` (`app.jsx:5-19`). Aquí se sustituye por rutas reales del App Router.

| Ruta del prototipo | Ruta Next | Archivo |
| --- | --- | --- |
| `{name:"biblioteca"}` | `/` | `app/page.tsx` |
| `{name:"detalle", id}` | `/juegos/[id]` | `app/juegos/[id]/page.tsx` |
| `{name:"player", id}` | `/juegos/[id]/jugar` | `app/juegos/[id]/jugar/page.tsx` |
| `{name:"auth"}` | `/auth` | `app/auth/page.tsx` |
| `{name:"salon"}` | `/salon` | `app/salon/page.tsx` |

Un `id` desconocido llama a `notFound()`. El prototipo no tenía rama 404: `detalle.jsx:7` devolvía `null` y `reproductor.jsx:5` reventaba.

## Modelo de datos

Tipos en `app/types.ts`:

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "green" | "yellow";

export interface Game {
  id: string;      // slug, también param de ruta
  title: string;
  short: string;   // blurb de la tarjeta
  long: string;    // párrafo del detalle
  cat: GameCategory;
  cover: string;   // clase CSS: cover-bricks, cover-tetro, ...
  color: GameColor;
  best: number;
  plays: string;   // preformateado, p. ej. "12.4K"
}

export interface ScoreRow { rank: number; name: string; score: number; date: string }
export interface SessionUser { name: string }
export interface SavedScore { game: string; score: number; name: string; at: number }
```

Datos ficticios en `app/data.ts`, port literal de `references/templates/data.jsx`.

Este archivo es el sustituto temporal de la base de datos. Cuando exista la base de datos real, se reemplaza la implementación de `app/data.ts` manteniendo las mismas firmas exportadas, y ningún componente cambia. Ningún componente lee los datos de otro sitio.

Exporta:

- `GAMES` — 8 entradas con los mismos ids y valores: `bloque-buster`, `caida`, `serpentina`, `gloton`, `invasores`, `rocas`, `ranaria`, `duelo-pixel`.
- `CATS` — `["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]`. `"TODOS"` es el centinela de "sin filtro".
- `PLAYERS` — 18 nombres, privado al módulo.
- `seededScores(seed, count = 12)` — generador congruencial lineal `s = (s * 9301 + 49297) % 233280`. Es una función pura sin APIs de navegador, así que puede ejecutarse en el servidor.
- `formatScore(n)` — único envoltorio de `toLocaleString("es-ES")`. El prototipo lo repite en diez sitios.

Las semillas de los llamadores se conservan exactas para que las tablas salgan idénticas al prototipo: el detalle usa `id.length * 17 + 3` con 10 filas (`detalle.jsx:6`), el salón usa `tab.length * 23 + 7` con 12 filas (`salon.jsx:6`).

Claves de `localStorage`, sin cambios respecto al prototipo:

- `av_user` — `SessionUser | null`.
- `av_scores` — `SavedScore[]`. Solo se escribe, nadie la lee. Se mantiene por fidelidad.

## Plan de implementación

1. Crear `app/types.ts` y `app/data.ts` con `GAMES`, `CATS`, `seededScores` y `formatScore`. Prueba manual: `npm run build` compila.
2. Crear `components/session-provider.tsx` (`"use client"`) con contexto de `user`, `signIn` y `signOut`. La lectura de `av_user` va dentro de `useEffect`, nunca en el inicializador de `useState`.
3. Crear `components/nav.tsx` (`"use client"`) portando `nav.jsx` con `<Link>` y `usePathname()`. El enlace de biblioteca queda activo también en `/juegos/*`. Montar `Nav`, `<main className="av-main">` y el footer en `app/layout.tsx`, dentro de `#root`. El footer, que en el prototipo llevaba estilos inline (`app.jsx:43`), se escribe con utilidades de Tailwind.
4. Crear `components/game-card.tsx` (`"use client"`) con el tilt 3D imperativo: `useRef`, `getBoundingClientRect` y mutación directa de `el.style.transform`. El botón JUGAR usa `e.stopPropagation()`.
5. Crear `components/library.tsx` (`"use client"`) con el buscador `q`, el filtro de categoría `cat`, el `useMemo` de filtrado y el estado vacío. Reemplazar `app/page.tsx` por la biblioteca.
6. Crear `app/juegos/[id]/page.tsx` como Server Component: portada, tags, tira de stats y leaderboard de 10 filas. Los dos botones van en una isla cliente aparte.
7. Crear `components/game-player.tsx` (`"use client"`) con el HUD, el marco CRT y la arena. Montarlo desde `app/juegos/[id]/jugar/page.tsx`. La arena va en un componente aparte, `components/game-placeholder.tsx`, copiado tal cual del prototipo: es el hueco donde más adelante se montará cada juego real.
8. Añadir a `components/game-player.tsx` el modal de fin de partida: input de nombre en mayúsculas recortado a 10 caracteres, guardado en `av_scores` y mensaje `▸ PUNTUACIÓN GUARDADA_`.
9. Crear `components/auth-form.tsx` (`"use client"`) y `app/auth/page.tsx` con las pestañas `in` y `up`, los tres campos y el botón de invitado.
10. Crear `components/hall-of-fame.tsx` (`"use client"`) y `app/salon/page.tsx` con los 8 chips, el podio y la tabla de 12 filas.
11. Añadir a `components/hall-of-fame.tsx` el bloque "tu mejor marca", visible solo con sesión iniciada.
12. Crear `app/not-found.tsx` con el aspecto del tema y borrar los restos del scaffold en `public/`.

## Detalles de comportamiento a replicar

Estos comportamientos del prototipo se portan tal cual, incluidas sus rarezas.

- **Biblioteca.** La búsqueda filtra solo por título, en minúsculas y sin plegar acentos (`biblioteca.jsx:50`). Escribir `caida` no encuentra `CAÍDA`.
- **Reproductor.** `setInterval` de 220 ms que suma `10 + Math.random() * 90` puntos (`reproductor.jsx:16`). El intervalo se desmonta cuando `over` o `paused` son verdaderos. La subida de nivel usa la heurística `score > 0 && score % 2500 < 100` (`reproductor.jsx:21`). Las vidas nunca bajan: `setLives` solo se llama al reiniciar. El fin de partida es manual, únicamente por el botón FIN. El modal no se puede cerrar haciendo clic fuera.
- **Auth.** Sin validación. Un usuario vacío se convierte en `PLAYER1` (`auth.jsx:12`). El correo y la contraseña se capturan en estado y nunca se usan. Las dos pestañas ejecutan el mismo handler. Los botones de Google y GitHub no tienen `onClick`.
- **Salón.** `youRank` es `8 + (tab.length % 4)` y `youScore` es `rows[5].score - 2400` (`salon.jsx:8-9`). La fecha de la fila propia está fijada a `11/05/2026`.
- **Nav.** El contador de créditos `CRÉDITOS · 03` es texto estático, no estado.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings.
- [ ] `/` lista 8 tarjetas.
- [ ] Escribir en el buscador filtra por título y los chips filtran por categoría.
- [ ] Combinar buscador y chip sin coincidencias muestra el estado vacío.
- [ ] Hacer clic en una tarjeta navega a `/juegos/<id>`.
- [ ] El botón JUGAR de la tarjeta navega a `/juegos/<id>/jugar` sin pasar por el detalle.
- [ ] `/juegos/caida` muestra título, párrafo largo, tags, tira de stats y leaderboard de 10 filas.
- [ ] Las tres primeras filas del leaderboard salen en oro, plata y bronce.
- [ ] `/juegos/xxx-inexistente` devuelve 404 en lugar de reventar.
- [ ] En `/juegos/<id>/jugar` la puntuación sube sola cada 220 ms.
- [ ] PAUSA congela la puntuación y reanudar la continúa.
- [ ] FIN abre el modal de fin de partida.
- [ ] Guardar la puntuación muestra `▸ PUNTUACIÓN GUARDADA_` y añade una entrada a `av_scores` en localStorage.
- [ ] En `/auth`, la pestaña CREAR CUENTA muestra el campo de correo y INICIAR SESIÓN lo oculta.
- [ ] Enviar el formulario con el usuario vacío deja la Nav mostrando `PLAYER1 ▾`.
- [ ] La sesión sobrevive a un recargado de página.
- [ ] Con sesión iniciada, `/salon` muestra el bloque `▸ TU MEJOR MARCA EN ...`. Sin sesión, no aparece.
- [ ] Las 8 pestañas del salón cambian podio y tabla, y la misma pestaña devuelve siempre las mismas filas.
- [ ] No hay ninguna advertencia de hidratación en la consola en las cinco rutas.
- [ ] Ningún componente define datos de juegos o puntuaciones en línea: todo sale de `app/data.ts`.
- [ ] La arena del reproductor vive en `components/game-placeholder.tsx` y se puede sustituir sin tocar el HUD ni el modal.
- [ ] No existe `tailwind.config.js` y no se ha añadido ninguna hoja de estilos aparte de `app/globals.css`.
- [ ] Ningún componente usa el atributo `style` con valores estáticos: eso se resuelve con utilidades de Tailwind. Se permite `style` solo para valores calculados en runtime, como el `animationDelay` escalonado de la tabla del salón y el `transform` del tilt de las tarjetas.
- [ ] Comparadas contra `references/templates/Arcade Vault.html` abierto en el navegador, las cinco pantallas coinciden en fondo, tipografías, neones y espaciado.

## Decisiones

- **Sí:** rutas reales del App Router. El `location.hash` del prototipo no tiene listener de `hashchange`, así que Atrás y Adelante cambian la URL sin re-renderizar. Las rutas reales lo arreglan y dan URLs compartibles.
- **No:** una sola página con `useState` conmutando pantallas. Desperdicia el App Router y arrastra el bug de navegación.
- **Sí:** modelo de estilos en dos capas. `app/globals.css` aporta el tema y el arte CSS que ya está migrado; Tailwind aporta layout, espaciado y responsive en el JSX. `globals.css` es editable cuando haga falta.
- **No:** escribir CSS nuevo para cosas que una utilidad de Tailwind ya resuelve.
- **No:** estilos inline con valores estáticos, como el footer del prototipo. Se convierten a utilidades.
- **Sí:** `localStorage` con las claves originales `av_user` y `av_scores`. Permite ver la Nav en sus dos estados tras recargar.
- **No:** estado de sesión solo en memoria. La Nav aparecería siempre deslogueada al recargar.
- **Sí:** la simulación visual completa del reproductor. El HUD y el modal de fin de partida son pantallas del diseño y sin la simulación no se pueden ver.
- **No:** carcasa CRT estática con un `INSERT COIN`. Deja fuera dos estados del diseño.
- **Sí:** todos los datos ficticios en un solo `app/data.ts`, con las firmas que tendrá la capa de datos real. Sustituirlo por la base de datos no debe tocar ningún componente.
- **Sí:** la arena del reproductor aislada en `components/game-placeholder.tsx`. Por ahora es el arte CSS del prototipo copiado tal cual; cuando lleguen los juegos reales, se sustituye solo ese componente.
- **Sí:** un único `formatScore` en `app/data.ts`. Evita que el mismo número se formatee distinto en servidor y en cliente.
- **Sí:** textos de interfaz en español, literales del prototipo.
- **Nota:** las decisiones de esta spec se tomaron por defecto, sin la ronda de preguntas de `/spec`. El usuario declinó el bloque de preguntas y luego fijó la estrategia de estilos por escrito. Quedan aquí para revisarse antes de aprobar la spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `localStorage` y `Date.now()` en el primer render provocan desajuste de hidratación. El prototipo lee `av_user` en el inicializador de `useState` (`app.jsx:13`). | El paso 2 confina esas lecturas a `useEffect`. Nada que dependa de la sesión se renderiza en el servidor. |
| `toLocaleString("es-ES")` puede agrupar distinto en Node y en el navegador (espacio fino frente a punto). | `formatScore` en un único módulo. Cada número se renderiza solo en servidor o solo en cliente, nunca en ambos. |
| Mezclar utilidades de Tailwind con las clases del tema puede generar conflictos de especificidad, sobre todo en `padding` y `background` de `.btn`, `.card` y `.chip`. | Las utilidades se aplican al contenedor, no al elemento que ya trae clase de tema. Si hace falta, se ajusta la regla en `app/globals.css` en vez de pelearla con `!important`. |
| Las semillas derivan de la longitud del id, así que juegos con ids de igual longitud comparten leaderboard (`caida` y `rocas`). | Defecto heredado del prototipo. Se replica a propósito y se anota aquí. Corregirlo va en otra spec. |
| `.btn.green` no existe en `styles.css`, así que los juegos con `color: "green"` caen al estilo cian base. | Defecto heredado. Se replica. Si se quiere corregir, se añade el modificador en `app/globals.css`, que es editable. |
| El prototipo usa `<a onClick>` sin `href` (`nav.jsx:17-18`), inaccesible por teclado. | El port usa `<Link>`, que cambia levemente el markup pero conserva las clases y el aspecto. |

## Lo que **no** entra en esta spec

- Ningún juego jugable: sin bucle de juego, sin input de teclado, sin colisiones.
- Backend, base de datos y autenticación real.
- Puntuaciones reales persistidas y leídas.
- Tests automatizados.
- Reescribir a utilidades el arte CSS del tema que ya funciona (`.crt`, `.cover-*`, `.game-arena`).

Cada uno de esos puntos, si entra, va en su propia spec.
