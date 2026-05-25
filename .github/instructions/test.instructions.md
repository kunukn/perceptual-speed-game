---
applyTo: '**/*.test.ts,**/*.test.tsx'
---

# Testing Guidelines

These instructions apply when writing or modifying test files (`*.test.ts` / `*.test.tsx`).

## Test Framework & Environment

- **Runner**: Vitest with `globals: true` and `jsdom` environment
- **Component testing**: React Testing Library (`@testing-library/react`)
- **Setup file**: `src/vitest.setup.ts` — globally mocks `IntersectionObserver` and `ResizeObserver`, and stubs `fetch` to reject so any stray network call surfaces loudly
- **CI**: Tests run on Linux with jsdom — avoid platform-specific assertions

## File Naming

| Extension | Usage |
|-----------|-------|
| `.test.ts` | Pure utility/logic functions with no JSX |
| `.test.tsx` | React components, hooks, and context (anything that imports JSX) |

Test files live next to the source file they test:

```
src/utils/naturalSort.ts
src/utils/naturalSort.test.ts

src/components/Card/Card.tsx
src/components/Card/Card.test.tsx
```

## Imports

Since `globals: true` is enabled, **do not import** `describe`, `test`, `it`, `expect`, `beforeEach`, `afterEach`, or `vi` from vitest — they are available as globals.

```typescript
/* ❌ Unnecessary — these are auto-imported globals */
import { describe, expect, it, vi } from 'vitest'

/* ✅ Correct — only import what is not global */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

Import order in test files:

1. Testing library imports (`@testing-library/react`, `userEvent`)
2. Source code imports (the module under test)
3. Mock data / helper imports

## Test Structure

### `describe` blocks

Use the component, hook, or function name. Add a dash-separated context when testing a specific feature or scenario:

```typescript
/* Utility function — name only */
describe('naturalSort', () => { ... })

/* Component — name only when testing general behavior */
describe('ConfirmDialog', () => { ... })

/* Component — with context for specific feature */
describe('SettingsPanel - Theme Selection', () => { ... })

/* Hook — with context */
describe('useTableFilter - search functionality', () => { ... })
```

### `test` blocks

Use `test()` (not `it()`). Start with `should` for behavior tests. Use a verb phrase for utility functions:

```typescript
/* ✅ Behavior — "should [expected outcome]" */
test('should render loading state while fetching', () => { ... })
test('should call onDismiss when dismiss button is clicked', () => { ... })
test('should not render when isOpen is false', () => { ... })

/* ✅ Utility — verb phrase describing the return/behavior */
test('returns false when under the limit', () => { ... })
test('sorts numbers before strings', () => { ... })

/* ❌ Avoid vague or capitalized names */
test('Format TimeSpan', () => { ... })
test('works', () => { ... })
```

### Parameterized tests

Use `test.each` for testing multiple inputs:

```typescript
test.each([
  { input: 'abc', expected: 'ABC' },
  { input: '', expected: '' },
])('should uppercase "$input" to "$expected"', ({ input, expected }) => {
  expect(toUpper(input)).toBe(expected)
})
```

## Test Rationale Comments

**Every `describe` block MUST be preceded by a block comment explaining why the test deserves to exist.** This is a quality gate, not paperwork. A test that cannot justify itself in 2–6 lines is almost always a test worth deleting — see [Smell-check: tests that probably shouldn't exist](#smell-check-tests-that-probably-shouldnt-exist) below.

### Why this is mandatory

Tests are not free. They take time to maintain, they slow down refactors, and stale tests actively mislead. The way to make sure each test pays its rent is to write down — at the moment of creation — *what contract it protects* and *what breaks if it disappears*. If you can't articulate that, the test isn't earning its place.

Reading the rationale six months later is also how the next person (or you) decides whether a failing test reflects a real regression or just a spec change. Without the rationale, every red test becomes a guessing game.

### The three-part template

A good rationale comment answers three questions:

1. **What contract / invariant does this test protect?** (the *what*)
2. **What concrete failure mode does it catch?** (the *how it breaks*)
3. **Why would that failure be hard to catch without this test?** (the *why a test is the right tool*)

Format: a `/* */` block comment placed directly above the `describe`. Aim for 3–8 lines. Block comments — not multiple `//` lines (matches the project convention).

### Canonical examples

These are taken from `src/features/game/machine.test.ts`. Use them as templates.

**Example 1 — protecting a user-facing format contract:**

```typescript
/*
 * Why this matters: formatElapsed is one line of code, but every timer and
 * results screen depends on its exact output ("1.2s", one decimal). A "small
 * cleanup" that rounds to whole seconds, swaps in Intl.NumberFormat, or
 * changes the unit silently changes every time displayed in the app. This
 * test makes such a change impossible to ship without an explicit decision.
 */
describe('formatElapsed', () => { ... })
```

**Example 2 — protecting a hand-maintained table across N variants:**

```typescript
/*
 * Why this matters: the Intro screen teaches the player by showing a worked
 * example whose correct answer is always "3 matches". That promise is encoded
 * across 7 hand-built EXAMPLE_PUZZLES entries — kana and emoji included. A
 * future edit to any non-Latin entry could easily introduce a 4-match row or
 * a mismatch in the wrong column, and the intro would teach a wrong example
 * with no compile error. This test enforces the shape for every system at
 * once, so editing the table can't silently break the tutorial.
 */
describe('getExamplePuzzle', () => { ... })
```

**Example 3 — property-style invariants over non-deterministic logic:**

```typescript
/*
 * Why this matters: generateRound is the most logic-heavy function in this
 * file — Math.random, a "used pairs" set, intricate match-column assignment.
 * Exactly the shape of code where off-by-one and boundary bugs hide. We don't
 * seed RNG; we sample 50 rounds per letter system and assert the invariants
 * that MUST hold for the game to be playable (4 cols everywhere, answer
 * equals the number of matches, answer in [0..4]). A regression here is the
 * kind of bug a player would actually hit — wrong scoring or a broken letter
 * system — and would show up as "the game is just wrong," nearly impossible
 * to triage from a bug report.
 */
describe('generateRound - invariants', () => { ... })
```

**Example 4 — a silent failure mode that takes time to manifest:**

```typescript
/*
 * Why this matters: time mode is endless — rounds are appended lazily as the
 * player approaches the buffer boundary. The implementation is three lines of
 * dense logic in recordAnswer (mode check AND boundary check AND immutable
 * append) and the failure mode is silent: a player runs out of rounds ~30s
 * into time mode and the UI tries to render an undefined round. This test
 * pins both halves of the contract:
 *   1. The buffer does NOT grow mid-buffer (no eager generation).
 *   2. The buffer grows by exactly one when crossing the boundary.
 * An off-by-one regression (e.g. `>` instead of `>=`) is essentially
 * undetectable in casual dev play because it takes 10 answers to manifest.
 */
describe('gameMachine - time mode lazy rounds', () => { ... })
```

### Phrases worth reaching for

Strong rationale comments tend to use phrasing like:

- *"silently changes…"* / *"fails silently"* — points to a regression that wouldn't be noticed in dev
- *"with no compile error"* — TypeScript can't catch this; only a test can
- *"every X depends on…"* — explains the blast radius
- *"would show up as 'the game is just wrong'"* — names the user-visible symptom
- *"takes N answers / N seconds to manifest"* — explains why dev play-testing misses it
- *"pins both halves of the contract"* — explicit about what's being locked in
- *"essentially undetectable in casual dev play"* — explains why a manual smoke test isn't enough

### Smell-check: tests that probably shouldn't exist

If you can't honestly write a rationale that answers the three questions above, the test is probably one of these:

| Smell | Example | What to do |
|---|---|---|
| **Asserts a declarative config line back to itself** | Testing that an XState transition `ABORT: { target: 'idle' }` goes to `'idle'`. The machine IS the spec — there's no logic to break. | Delete it. Trust types + a 5-second manual smoke test. |
| **Asserts the framework works** | Testing that `useState` updates state, or that a zustand `set({ foo: 1 })` sets `foo` to `1`. | Delete it. The framework's own tests cover this. |
| **Re-implements the function to check the function** | Test computes `a + b` and asserts the SUT returns `a + b`. | Delete or replace with a *table of known inputs and outputs* — the table is the contract, not the recomputation. |
| **Mocks everything down to the assertion** | Test mocks the API client, the cache, the formatter, then asserts the SUT calls them in order. | Delete or rewrite as an integration test — the mock setup IS the production code path, so the test only protects the mock setup. |
| **Asserts implementation details** | Test asserts a specific internal function was called, rather than the observable result. | Rewrite to assert behavior. If you can't, the abstraction probably leaks. |

**The deletion test:** if a regression in this code would either (a) cause a TypeScript error, (b) be obvious in 5 seconds of manual testing, or (c) only happen if someone edits the spec on purpose — the test is not earning its place.

## Mocking

### Module mocks — `vi.mock()`

Place at the top of the file, before any test code. Use for external dependencies and sibling modules:

```typescript
vi.mock('@/apis/userApi', () => ({
  userApi: {
    getUserById: (...args: unknown[]) => mockGetUserById(...args),
  },
}))
```

### Function mocks — `vi.fn()`

Use for callbacks, event handlers, and functions you need to verify calls on:

```typescript
const onCheckedChange = vi.fn()
render(<Checkbox onCheckedChange={onCheckedChange} />)

await userEvent.click(screen.getByRole('checkbox'))
expect(onCheckedChange).toHaveBeenCalledTimes(1)
```

### Spies — `vi.spyOn()`

Use for observing existing functions without replacing them. Always use `vi.spyOn` (not `vitest.spyOn`):

```typescript
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
// ... test ...
warnSpy.mockRestore()
```

### Global mocks already available

`IntersectionObserver` and `ResizeObserver` are mocked in `vitest.setup.ts` — do not re-mock them in individual test files.

## Rendering

### Components

```typescript
render(<Component prop={value} />)
expect(screen.getByText('Hello')).toBeInTheDocument()
```

### Components with providers

```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SomeProvider>{children}</SomeProvider>
)
render(<Component />, { wrapper })
```

### Hooks

```typescript
const { result } = renderHook(() => useCustomHook(args), { wrapper })

expect(result.current.data).toEqual(expectedData)

act(() => {
  result.current.updateSomething(newValue)
})
```

### Async operations

Use `waitFor` for assertions that depend on async state updates:

```typescript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})
```

Use `act` when triggering state changes in hooks:

```typescript
await act(async () => {
  await userEvent.click(screen.getByRole('button'))
})
```

## Assertions

Use the correct matcher for the value type:

| Value type | Matcher |
|-----------|---------|
| Primitives (string, number, boolean) | `toBe()` |
| Objects and arrays | `toEqual()` |
| Array length | `toHaveLength()` |
| DOM presence | `toBeInTheDocument()` |
| DOM absence | `expect(screen.queryByText('x')).toBeNull()` |
| DOM attributes | `toHaveAttribute('title', 'value')` |
| DOM text content | `toHaveTextContent('text')` |
| DOM classes | `toHaveClass('class-name')` |
| Mock called | `toHaveBeenCalledTimes(n)` / `toHaveBeenCalledWith(args)` |
| Mock not called | `not.toHaveBeenCalled()` |

Use `screen.getBy*` when the element must exist. Use `screen.queryBy*` when asserting absence (returns `null` instead of throwing).

## Test Data

### Inline — for simple, single-use data

```typescript
test('should format name', () => {
  expect(formatName({ first: 'John', last: 'Doe' })).toBe('John Doe')
})
```

### Factory functions — for reusable or complex data

Define at the top of the test file with sensible defaults and allow overrides:

```typescript
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-id',
  name: 'Test User',
  status: UserStatus.Active,
  ...overrides,
})

test('should show error for inactive users', () => {
  const user = createMockUser({ status: UserStatus.Inactive })
  // ...
})
```

### Separate mock files — for large datasets

Use `*.mock.ts` or `*.mock.json` next to the test file:

```typescript
import { getMockUsers } from './useUserQuery.mock'
import mockSamples from './useChartData.mock.json'
```

## Setup & Teardown

Use `beforeEach` to reset state before each test. Prefer `beforeEach` over `afterEach` for cleanup — it guarantees a clean slate even if a previous test threw:

```typescript
beforeEach(() => {
  localStorage.clear()
  mockFn.mockReset()
})
```

Use `afterEach` only when you need cleanup that differs from setup (e.g., restoring a patched global).

## Common Pitfalls

- **Every `describe` needs a rationale comment** — see [Test Rationale Comments](#test-rationale-comments). If you can't write one, delete the test.
- **Do not re-mock IntersectionObserver or ResizeObserver** — already handled in `vitest.setup.ts`
- **Do not import vitest globals** — `vi`, `describe`, `test`, `expect`, `beforeEach`, `afterEach` are all available without imports
- **Use `vi.spyOn`**, not `vitest.spyOn` — consistent prefix across the codebase
- **Use `screen.queryBy*` for absence checks** — `getBy*` throws if the element is missing, which is not what you want when asserting something should not be rendered
- **Avoid hardcoded dates** — use `vi.useFakeTimers()` or relative values from `Date.now()`
- **Prefer Testing Library queries over raw DOM** — use `toHaveTextContent()` instead of `.innerHTML`, use `toHaveAttribute()` instead of `.title`
- **Reset mocks in `beforeEach`** — prevents test pollution from mock state leaking between tests
