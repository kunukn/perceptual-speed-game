# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + TypeScript + Vite. Styling: Tailwind CSS 4 + Emotion + shadcn/Radix UI components. State: Zustand (stores) and XState (state machines) — both are actively used; pick whichever fits the situation rather than introducing a third pattern.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — typechecks (`tsc -b`) then Vite production build
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check (CI-style)

No test runner is wired up. `vitest` and `playwright` are installed but `vitest.config.ts` is empty and there are no tests. Do not add tests unless explicitly asked.

## Conventions

- Always run `npm run format` after edits to keep Prettier-clean (single quotes, semicolons, tailwind class sorting).
- TypeScript strict mode is on, plus `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Don't leave unused symbols.
- Prefer existing `components/ui` (shadcn/Radix) over hand-rolling new UI primitives.
- **Auto-imports are configured** via `unplugin-auto-import` (see `auto-import.config.ts`): React hooks, `react-router` exports, and `Button` are auto-imported — don't add explicit import statements for them.

## Debug toggles

`VITE_CODE_INSPECTOR` and `VITE_RAINBOW_DEBUG` env vars enable dev-only tooling in `src/debug/` and the Vite config.
