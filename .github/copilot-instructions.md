# Copilot Instructions

This file provides guidance to AI coding assistants when working with code in this repository.

## Stack

React 19 + TypeScript + Vite. Styling: Tailwind CSS 4 + Emotion + shadcn/Radix UI components. State: Zustand (stores) and XState (state machines) — both are actively used; pick whichever fits the situation rather than introducing a third pattern.

## Commands

- `pnpm dev` — Vite dev server
- `pnpm build` — typechecks (`tsc -b`) then Vite production build
- `pnpm format` — Prettier write
- `pnpm format:check` — Prettier check (CI-style)

No test runner is wired up. `vitest` and `playwright` are installed but `vitest.config.ts` is empty and there are no tests. Do not add tests unless explicitly asked.

## Conventions

- Always run `pnpm format` after edits to keep Prettier-clean (single quotes, semicolons, tailwind class sorting).
- TypeScript strict mode is on, plus `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Don't leave unused symbols.
- Prefer existing `components/ui` (shadcn/Radix) over hand-rolling new UI primitives.
- **Auto-imports are configured** via `unplugin-auto-import` (see `auto-import.config.ts`): React hooks, `react-router` exports, and `Button` are auto-imported — don't add explicit import statements for them.

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

### Build Verification

After completing all code changes, run `pnpm build` as the final step — it runs `tsc -b` and will surface any type errors. Do not consider the task complete until the build passes. Fix any errors before finishing.

```bash
pnpm build
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
- ✅ Run `pnpm build` as the final step to verify no type errors
- ✅ Add a blank line after single-line `return` statements
- ✅ Annotate every `useMemo` / `useCallback` with its rationale
- ✅ Use `/* */` for multiline comments, `//` for single-line only
- ✅ Keep AI responses succinct — no filler, no pleasantries, lead with the answer
