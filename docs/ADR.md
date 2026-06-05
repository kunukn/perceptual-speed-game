# Architecture Decision Record

This document records significant architectural decisions for the Perceptual Speed Game. Each entry follows the format **Status / Context / Decision / Consequences**.

## ADR-001: Minimize the codebase to reduce clutter

**Status**: Accepted

### Context

The app has grown past 1000 React components. At that scale, two kinds of noise dominate every file:

- **Repetitive imports** — the same handful of symbols (`useState`, `useEffect`, `useNavigate`, `cn`, generic UI components, shared API clients) are imported at the top of almost every file.
- **Syntactic clutter** — double quotes and trailing semicolons add visual weight on every line without adding meaning.

Multiplied across hundreds of files, this inflates line counts, enlarges diffs, and slows down scanning and review. The goal is to keep files as small and scannable as possible so the codebase stays navigable as it continues to grow.

### Decision

Apply three project-wide simplification tactics, all enforced by tooling so they require no manual effort.

#### 1. Auto-imports

Commonly used symbols are auto-imported via [`unplugin-auto-import`](https://github.com/unplugin/unplugin-auto-import), driven by a central allow-list in `auto-import.config.ts` and wired into the build in `vite.config.ts`:

```ts
// vite.config.ts
AutoImport({
  imports: autoImportConfig as any,
  dts: true, // generates auto-imports.d.ts for type safety
});
```

The allow-list covers React hooks, `react-router` hooks/components, `cn`/`clsx`, frequently used generic components. For any symbol on the list, no `import` statement is needed:

```tsx
// ❌ Before — explicit imports on every file
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/utils/cn';

// ✅ After — auto-imported, just use them
const [open, setOpen] = useState(false);
const navigate = useNavigate();
```

The `dts: true` option generates `auto-imports.d.ts`, so TypeScript and editor IntelliSense still resolve every auto-imported symbol.

#### 2. Single quotes instead of double quotes

TypeScript/JavaScript string literals use `'single quotes'`, enforced by `.prettierrc`:

```json
{ "singleQuote": true }
```

#### 3. No semicolons at line endings

JavaScript/TypeScript statements omit trailing semicolons, enforced by `.prettierrc`:

```json
{ "semi": false }
```

### Consequences

**Benefits**

- Fewer lines per file and less horizontal/vertical noise — files stay scannable at scale.
- Smaller, cleaner diffs (no import churn for common symbols, no quote/semicolon edits).
- A single source of truth (`auto-import.config.ts`) for the project's most-used imports.

**Trade-offs**

- Auto-imported symbols are "magic" — they are not visible at the top of the file. Mitigated by the generated `auto-imports.d.ts` and editor IntelliSense, which resolve and document them.
- Contributors must check `auto-import.config.ts` before adding an import; if a symbol is already auto-imported, an explicit import is redundant.
- Introducing a new widely-shared symbol means updating `auto-import.config.ts` rather than importing it ad hoc.

### How to apply

- Run `pnpm format` to enforce single quotes and no semicolons (Prettier).
- Before adding an `import`, check `auto-import.config.ts` — if the symbol is listed, omit the import.
- To make a new shared symbol auto-importable, add it to `auto-import.config.ts`.
