# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es este proyecto

Arcade Vault: plataforma web para jugar juegos arcade online y competir por puntuación (ver `README.md`).

Estado actual: **scaffold de `create-next-app` sin modificar**. `app/page.tsx` y `app/layout.tsx` siguen siendo la plantilla por defecto (logo de Next, metadata "Create Next App"). No existe todavía código de juegos, rutas, ni backend. La primera tarea real implicará reemplazar esa plantilla.

Los proyectos hermanos (`../02-claude-asteroids`, `../03-claude-tetris`, `../04-arkanoid`) son juegos en HTML/JS plano y sirven como referencia de mecánicas, no de arquitectura: este proyecto es Next.js/React.

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

El historial del repo padre muestra el patrón esperado: una rama por SPEC, un commit `feat(...)` con el número de SPEC en el mensaje, y un merge commit `Merge SPEC NN: <descripción>`. Los mensajes de commit son Conventional Commits en español.

Si las skills `/spec` y `/spec-impl` no aparecen disponibles en la sesión, hay que instalarlas antes de empezar; no improvisar un flujo distinto.

## Git

El directorio de trabajo (`05-arcade-vault/`) **no es la raíz del repositorio**: el `.git` está un nivel arriba, en `curso-ia-fernando-herrera/`. Los comandos de git operan sobre todo el curso, no solo sobre este proyecto. A la fecha de escritura, este directorio completo está sin trackear (`?? ./`).

## Convenciones del stack

- **Next.js 16 + React 19, App Router.** Antes de escribir código de framework, consultar `node_modules/next/dist/docs/` (ver `AGENTS.md`): esta versión tiene cambios que rompen respecto a versiones anteriores.
- Los tipos de props de rutas son **globales generados**, no importados: `RootLayout` usa `LayoutProps<"/">` directamente. Mismo patrón para `PageProps`.
- **Tailwind v4 CSS-first.** No existe `tailwind.config.js` ni debe crearse: los tokens de diseño se declaran en `app/globals.css` con `@import "tailwindcss"` y el bloque `@theme inline`. Las variables de fuente (`--font-geist-sans`, `--font-geist-mono`) vienen de `next/font/google` en el layout.
- Alias de imports: `@/*` apunta a la raíz del proyecto.
- TypeScript en modo `strict`.
