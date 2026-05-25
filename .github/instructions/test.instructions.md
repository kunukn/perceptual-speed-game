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

- **Do not re-mock IntersectionObserver or ResizeObserver** — already handled in `vitest.setup.ts`
- **Do not import vitest globals** — `vi`, `describe`, `test`, `expect`, `beforeEach`, `afterEach` are all available without imports
- **Use `vi.spyOn`**, not `vitest.spyOn` — consistent prefix across the codebase
- **Use `screen.queryBy*` for absence checks** — `getBy*` throws if the element is missing, which is not what you want when asserting something should not be rendered
- **Avoid hardcoded dates** — use `vi.useFakeTimers()` or relative values from `Date.now()`
- **Prefer Testing Library queries over raw DOM** — use `toHaveTextContent()` instead of `.innerHTML`, use `toHaveAttribute()` instead of `.title`
- **Reset mocks in `beforeEach`** — prevents test pollution from mock state leaking between tests
