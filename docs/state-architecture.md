# ADR: State Management Architecture

## Status

Accepted — reflects the current implementation.

## Context

The app mixes several state mechanisms — XState, two Zustand stores, React context, and i18next — without a written rationale. A new contributor (or future-me) reading `machine-context.tsx` has to reverse-engineer _why_ live game state lives in XState, _why_ settings and high scores are separate Zustand stores, and _how_ data flows between them. `CLAUDE.md` only says "pick whichever fits the situation rather than introducing a third pattern" — useful as a rule, but not as an explanation.

This document records the decision and the data-flow shape so the rule has reasoning behind it.

The app has four kinds of state with different lifetimes and persistence needs:

- **Live game state** — current round, answers, elapsed time, current settings snapshot. Lives for one run, follows a strict state machine (`intro → options → playing → finished ↔ review`).
- **User settings** — mode, count target, time limit, letter system, mirror flags, timer visibility. Edited freely on the Options page, must survive reloads.
- **High scores** — one best record per variant key. Append-only from the game's perspective, must survive reloads.
- **UI locale** — current language, recently-used languages. Survives reloads.

The two state libraries already in the dependency tree (XState, Zustand) cover different problem shapes; React context is used only as a delivery mechanism.

## Decision

**Rule: pick the tool that matches the state's shape, not a single global pattern.**

| State                                        | Tool                                      | Where                                                | Why                                                                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live game flow + round data                  | XState                                    | `src/features/game/machine.ts`                       | Strict state transitions (`intro → options → playing → finished ↔ review`) with guards and actions. A reducer or store would leak invalid transitions; the machine makes them unrepresentable. |
| User-editable settings                       | Zustand + `persist`                       | `src/features/game/store/options.ts`                 | Flat key/value with localStorage persistence. No transitions to model. Zustand's selector hooks let pages subscribe to single fields without re-rendering on unrelated changes.                |
| High scores                                  | Zustand + `persist`                       | `src/features/game/store/high-scores.ts`             | Keyed dictionary written once per run, read by results screens. `recordScore` is the only mutation entry point and encapsulates the "is this a new best?" rule.                                |
| Locale                                       | i18next + `useLocalStorage` (usehooks-ts) | `src/i18n/index.ts`, `src/i18n/LanguageSwitcher.tsx` | i18next already owns the runtime state; the localStorage hook only persists the user's choice. No need to wrap it in Zustand.                                                                  |
| Machine-to-React bridge + transient confetti | React context + `useState`                | `src/features/game/machine-context.tsx`              | Avoids prop-drilling `state` / `send`. Confetti tier is ephemeral, scoped to one run, not worth a store.                                                                                       |

## Data Flow

One-way handoffs only. No syncing, no two-way binding.

```
            ┌─────────────────────────────────────────────┐
            │  Zustand: useGameOptions (persist)          │
            │  source of truth for *desired* settings     │
            └────────────────────┬────────────────────────┘
                                 │
                                 │  snapshot on START
                                 │  Intro.tsx:28
                                 │  send({ type: 'START',
                                 │         options: useGameOptions.getState() })
                                 ▼
            ┌─────────────────────────────────────────────┐
            │  XState: gameMachine                        │
            │  owns the live run (rounds, answers, etc.)  │
            │  + frozen copy of the settings used         │
            └────────────────────┬────────────────────────┘
                                 │
                                 │  on entry to `finished`
                                 │  machine-context.tsx:55-93
                                 │  useHighScores.getState()
                                 │    .recordScore(...)
                                 ▼
            ┌─────────────────────────────────────────────┐
            │  Zustand: useHighScores (persist)           │
            │  best result per variant key                │
            └─────────────────────────────────────────────┘
```

Two key invariants worth calling out:

1. **Settings are snapshotted, not subscribed.** Once a run starts, the machine's `context` holds its own copy. Toggling an Option mid-game won't affect the running game — by design.
2. **The high-scores write is imperative, not reactive.** [machine-context.tsx](../src/features/game/machine-context.tsx) uses `useHighScores.getState()` (not the hook) so the provider does _not_ re-render when scores change. A `recordedRef` keyed on `startedAt` guards against React 19 StrictMode's double-invoked effects.

## Why Context, Not Zustand, for the Machine

`GameMachineProvider` ([machine-context.tsx:17](../src/features/game/machine-context.tsx#L17)) wraps `useMachine` and exposes `{ state, send, lastResultTier, consumeConfetti }`. It could be a Zustand store, but:

- `useMachine` already gives a stable `send` and a `state` snapshot that re-renders on transitions.
- Wrapping it in Zustand would duplicate the subscription model with no gain.
- The provider also holds local `useState` for confetti — co-locating it next to the machine subscription keeps the bridge logic in one file.

## Why Two Zustand Stores Instead of One

Settings and high scores have different write patterns and different consumers. Splitting them means:

- Editing an option doesn't notify high-score consumers, and vice versa.
- Each store has its own `name` for localStorage (`game-options`, `high-scores`), making manual inspection and clearing straightforward.
- `recordScore` can stay focused on the "is this a new best?" rule without knowing about settings.

## Consequences

**Positive**

- Each piece of state lives in the tool whose strengths match the problem.
- The two handoff points (`START`, `finished`) are the only cross-store interactions — easy to audit.
- No global event bus, no synchronization bugs.

**Negative / trade-offs**

- A contributor must learn two state libraries to navigate the game feature.
- Settings duplication (Zustand copy + frozen XState copy) means "what settings is the current run using?" must be read from the machine, not the store. This is the right answer but is surprising at first glance.
- The confetti `pending` state is a third small piece of state that doesn't fit either library cleanly — documented here so it doesn't get "fixed" by someone unfamiliar with the reason.

## When to Deviate

Add a third pattern only if a new requirement genuinely doesn't fit either existing tool (e.g., server state → introduce TanStack Query). Don't add Redux, Jotai, or similar for state that XState or Zustand already handles well.
