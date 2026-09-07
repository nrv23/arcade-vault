# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es este proyecto

Arcade Vault: plataforma web para jugar juegos arcade online y competir por puntuación (ver `README.md`).

Estado actual: **SPEC 01 implementada** (MVP de pantallas visuales, sin backend). Rutas en `app/`: `/` (biblioteca), `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon`, `/auth` y `not-found`. Componentes en `components/`, datos de ejemplo en `app/data.ts` y tipos en `app/types.ts`. Los juegos todavía no tienen mecánica real (`components/game-placeholder.tsx`); la sesión es simulada en `components/session-provider.tsx` sobre `localStorage`, no hay autenticación ni persistencia de puntuaciones en servidor.

`references/templates/` contiene las plantillas de diseño de origen (React + CSS plano, cargadas por `Arcade Vault.html`): son la **fuente de verdad visual** de las pantallas. Al implementar o revisar UI, comparar contra ellas. `references/templates/styles.css` es el CSS original del que se derivan los tokens de `app/globals.css`.

Los proyectos hermanos (`../02-claude-asteroids`, `../03-claude-tetris`, `../04-arkanoid`) son juegos en HTML/JS plano y sirven como referencia de mecánicas, no de arquitectura: este proyecto es Next.js/React.

### Comparación visual con las referencias

El MCP de Playwright bloquea el protocolo `file:`, así que las plantillas no se pueden abrir directamente. Para compararlas con la implementación: copiar `references/templates/*` a `public/__ref/`, abrir `http://localhost:3000/__ref/Arcade%20Vault.html` junto a la ruta equivalente de Next, y borrar `public/__ref/` al terminar.

Las capturas de esas comparaciones se guardan en `.playwright-mcp/`, que **está trackeado en git a propósito** (no añadirlo a `.gitignore`): así viajan con el proyecto. `.gitignore` sí ignora `.playwright-screenshots/`, que es otra carpeta.

## Comandos

```bash
npm run dev     # servidor de desarrollo (next dev)
npm run build   # build de producción
npm start       # sirve el build
npm run lint    # eslint (flat config, sin argumentos)
```

No hay framework de tests configurado. Si se añade uno, documentar aquí cómo ejecutar un test individual.

## Metodología: Spec Driven Design

El flujo de trabajo del repo es el de `Klerith/fernando-skills` (instalado con `npx skills@latest add Klerith/fernando-skills`):

1. `/spec` — redactar la especificación de la funcionalidad antes de escribir código.
2. `/spec-impl` — implementarla a partir de esa spec.

Las specs viven en `specs/` numeradas (`01-mvp-pantallas-visuales.md`), con la configuración en `specs/.spec-config.yml`.

Patrón esperado: una rama por SPEC (`spec-NN-<slug>`), un commit `feat(spec-NN): ...` y un merge commit vía pull request. Los mensajes de commit son Conventional Commits en español.

Si las skills `/spec` y `/spec-impl` no aparecen disponibles en la sesión, hay que instalarlas antes de empezar; no improvisar un flujo distinto.

## Git

`05-arcade-vault/` **es la raíz del repositorio**: el `.git` está aquí y los comandos de git solo afectan a este proyecto, no al resto del curso. El remoto es `origin` → `https://github.com/nrv23/arcade-vault.git`, rama principal `main`.

## Convenciones del stack

- **Next.js 16 + React 19, App Router.** Antes de escribir código de framework, consultar `node_modules/next/dist/docs/` (ver `AGENTS.md`): esta versión tiene cambios que rompen respecto a versiones anteriores.
- Los tipos de props de rutas son **globales generados**, no importados: `RootLayout` usa `LayoutProps<"/">` directamente. Mismo patrón para `PageProps`.
- **Tailwind v4 CSS-first.** No existe `tailwind.config.js` ni debe crearse: los tokens de diseño se declaran en `app/globals.css` — la paleta y las fuentes en `:root`, y su exposición como utilidades de Tailwind en el bloque `@theme inline`. Al añadir un token, declararlo en los dos sitios.
- **Fuentes:** `Press_Start_2P`, `JetBrains_Mono` y `Courier_Prime` desde `next/font/google` en `app/layout.tsx`, expuestas como `--font-press-start`, `--font-jetbrains-mono` y `--font-courier-prime`, y consumidas por `--pixel` / `--mono` en `globals.css`. No hay fuentes Geist.
- Alias de imports: `@/*` apunta a la raíz del proyecto.
- TypeScript en modo `strict`.


## Skills 

Usa siempre /frontend-desing para diseñar la interfaz de usuario