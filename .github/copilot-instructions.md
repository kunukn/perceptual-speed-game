# Copilot Instructions

This file provides guidance to AI coding assistants when working with code in this repository.

## About this app

Perceptual Speed Game — a web game that measures the cognitive skill of rapidly
comparing visual symbols. Each round renders two rows of 4 glyphs (uppercase +
lowercase, or hiragana + katakana for Kana) and asks the player to count how
many vertical pairs are the **same letter**, case-insensitive (0–4).

- **Modes:** `count` (fixed number of rounds, scored on correct answers + total
  time) and `time` (play as many rounds as possible within a time limit; rounds
  are generated lazily).
- **Letter systems:** English, German, Accented, Greek, Cyrillic, Japanese Kana.
- **Post-game review** lets the player step through each round to see the
  correct answer and any wrong pick.
- **i18n:** UI translated into 14 locales with RTL support for Arabic and Urdu.
- **Persistence:** user settings (mode, limits, letter system, language) are
  saved in `localStorage`.

The XState machine in [`src/components/game/gameMachine.ts`](../src/components/game/gameMachine.ts)
is the source of truth for game rules and flow: `intro → options → playing →
results ↔ review`. Game-state changes should go through the machine; UI
components stay thin renderers.

## Stack

React 19 + TypeScript + Vite. Styling: Tailwind CSS 4 + Emotion + shadcn/Radix UI components. State: Zustand (stores) and XState (state machines) — both are actively used; pick whichever fits the situation rather than introducing a third pattern. See [docs/state-architecture.md](../docs/state-architecture.md) for the per-store rationale and data-flow diagram.

## Commands

- `pnpm dev` — Vite dev server
- `pnpm build` — typechecks (`tsc -b`) then Vite production build
- `pnpm format` — Prettier write
- `pnpm format:check` — Prettier check (CI-style)
- `pnpm test` — Vitest in watch mode
- `pnpm test:run` — Vitest single run (CI-style)
- `pnpm test:coverage` — Vitest run with v8 coverage

Vitest is wired up (`vitest.config.ts`, jsdom + Testing Library, setup in `src/vitest.setup.ts`). Unit tests live alongside source as `*.test.ts(x)` (currently under `src/features/game/`). Playwright is installed but has no config or e2e tests yet. Note `pnpm check` runs only typecheck + lint, not tests — run tests separately.

## Conventions

- Always run `pnpm format` after edits to keep Prettier-clean (single quotes, semicolons, tailwind class sorting).
- TypeScript strict mode is on, plus `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Don't leave unused symbols.
- Prefer existing `components/ui` (shadcn/Radix) over hand-rolling new UI primitives.
- **Auto-imports are configured** via `unplugin-auto-import` (see `auto-import.config.ts`): React hooks, `react-router` exports, and `Button` are auto-imported — don't add explicit import statements for them.
- **Playwright/browser screenshots go in `.temp/`** — never write screenshots (or other scratch artifacts) to the repo root. The `.temp/` folder is gitignored. When using a browser MCP tool, pass an explicit filename targeting `.temp/`, e.g. `.temp/intro.png`.

## Debug toggles

`VITE_CODE_INSPECTOR` and `VITE_RAINBOW_DEBUG` env vars enable dev-only tooling in `src/debug/` and the Vite config.

## Coding Guidelines

### Response Style

Be succinct. Every response should deliver maximum substance with minimum words.

- **Lead with the answer** — state the solution or key point first, then explain only if necessary
- **Drop filler** — remove words like "just", "really", "basically", "simply", "obviously", "of course"
- **No pleasantries** — skip "Sure!", "Great question!", "I'd be happy to help!", "Let me explain..."
- **No hedging** — avoid "I think", "It might be", "Perhaps you could" when you are confident
- **Short sentences** — prefer concise, direct phrasing over long-winded explanations
- **No repetition** — state things once; do not rephrase the same point in different words
- **Show, don't tell** — prefer a code snippet over a paragraph describing what the code would look like
- **Proper English** — maintain correct grammar and complete sentences; this is not shorthand or telegraphic

Example:

```text
// ❌ Verbose
"Sure! I'd be happy to help with that. The issue you're experiencing is most likely
caused by your authentication middleware not properly validating the token expiry.
Let me take a look at the code and suggest a fix for you."

// ✅ Succinct
"Bug is in the auth middleware — token expiry check uses `<` instead of `<=`. Here's the fix:"
```

### TypeScript Rules

- **Always use `type` instead of `interface`** for all type definitions
- Prefer type composition over inheritance
- Use type utilities: `Pick`, `Omit`, `Partial`, etc.
- Keep types close to where they're used

Example:

```typescript
type UserProfile = {
  id: string;
  name: string;
  email: string;
};

type UserPreferences = Pick<UserProfile, 'id' | 'name'>;
```

### Naming Conventions

- **Functions**: verbs in camelCase — `fetchUserData`, `handleSubmit`
- **Variables**: nouns in camelCase — `userProfile`, `isLoading`
- **Booleans**: prefix with `is`/`has`/`should` — `isVisible`, `hasPermission`
- **Components**: PascalCase
- **Avoid abbreviations** unless widely understood (use `index` not `idx`)
- No redundant words (use `user` not `userObject`)
- Group related variables with consistent prefixes (`userFirstName`, `userLastName`)

### Code Organization

- Flat is better than nested
- No generic 'helpers' folders
- Keep business logic in hooks or utils
- Prefer absolute import paths when not in the same folder. E.g. `import { Game } from '@/Game'` instead of `import { Game } from '../../Game'`

### Routing

**CRITICAL**: Always import from `react-router`, **NEVER** from `react-router-dom`. The latest version of React Router requires imports from `react-router` only.

```typescript
// ✅ Correct
import { useNavigate, Link } from 'react-router';

// ❌ Wrong
import { useNavigate, Link } from 'react-router-dom';
```

### Early Return Spacing

Always add a blank line after a single-line `return` (including early/guard returns) before the next statement. This improves readability by visually separating the guard clause from the rest of the logic.

```typescript
// ❌ Bad - no blank line after single-line return
if (!round) return;
const score = computeScore(round);

// ✅ Good - blank line after single-line return
if (!round) return;

const score = computeScore(round);
```

### Code Documentation

- Write self-documenting code through clear naming and structure
- Only add comments for complex business logic or non-obvious decisions
- Document public APIs and interfaces with JSDoc
- Avoid obvious comments that just repeat what the code does
- **Annotate every `useMemo` / `useCallback`** with a one-line comment stating the rationale (expensive compute, stable reference for deps, preventing child re-renders). Without a stated reason, the memoization is assumed unjustified and a candidate for removal.
- **Use `/* */` block comments for multiline comments**, not multiple `//` lines

Example:

```typescript
// ✅ Correct - block comment for multiline
/*
 * Debounce the resize handler so the grid only re-measures once
 * the user stops dragging, instead of on every intermediate frame.
 */

// ❌ Wrong - multiple single-line comments
// Debounce the resize handler so the grid only re-measures once
// the user stops dragging, instead of on every intermediate frame.

// ✅ OK - single-line comment stays as //
// This is a brief note about the next line
```

### Bug Discovery Logging

**CRITICAL**: Don't silently ignore bugs and don't silently fix them either. If you notice a bug that is **out of scope** for the current task — UI glitch, logic error, perf issue, a11y defect, broken type, stale doc, anything — append an entry to [BUGS.md](../BUGS.md) at the repo root instead of expanding the diff.

In-scope bugs (the thing you were asked to fix or are clearly inside the change you're making) are still fixed normally.

**Rule of thumb**: if fixing it would touch a file outside what the user asked for, log it; do not fix it.

**Entry format** (append to the bottom of `BUGS.md`, newest at the bottom):

```text
<YYYY-MM-DD>
Component: <file path or component name>
Expected: <what should happen>
Actual: <what currently happens>
Repro: <one-line steps to reproduce>
Workaround: <none, or a short note>
```

After logging, mention the entry in your end-of-turn summary so the user knows it was captured. Do not apply the fix unless the user explicitly asks for it.

### Code Verification

After completing all code changes, run `pnpm check` as the final step. Do not consider the task complete until the build passes. Fix any errors before finishing.

```bash
pnpm check
```

### Commit Message Format

Follow the Conventional Commits specification.

**Format**: `<type>[optional scope]: <description>`

**Types**:

- `feat:` — A new feature (MINOR version)
- `fix:` — A bug fix (PATCH version)
- `docs:` — Documentation only changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `perf:` — Performance improvement
- `test:` — Adding or correcting tests
- `chore:` — Build process or tooling changes

**Breaking Changes**: Must be indicated with `!` after the type/scope or in the footer.

**Examples**:

```text
feat(grid): add keyboard navigation
fix(timer): stop countdown when round ends
docs: update README with setup instructions
refactor(components): extract reusable card component
chore!: drop support for Node 18
```

**Commit Body** (optional): provide additional context — explain why the change was made, reference related issues.

**Commit Footer** (optional): reference issues/tickets, indicate breaking changes.

## Quick Reference Checklist

- ✅ Check `auto-import.config.ts` before adding import statements
- ✅ Import from `react-router` (NOT `react-router-dom`)
- ✅ Prefer existing `components/ui` (shadcn/Radix) over new UI primitives
- ✅ Use `type` not `interface`
- ✅ Use Zustand or XState for state — don't introduce a third pattern
- ✅ Follow Conventional Commits for commit messages
- ✅ Run `pnpm format` after edits
- ✅ Run `pnpm check` as the final step to verify no type errors
- ✅ Add a blank line after single-line `return` statements
- ✅ Annotate every `useMemo` / `useCallback` with its rationale
- ✅ Use `/* */` for multiline comments, `//` for single-line only
- ✅ Keep AI responses succinct — no filler, no pleasantries, lead with the answer
- ✅ Save Playwright/browser screenshots to `.temp/`, never the repo root
