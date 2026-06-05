import { createActor } from 'xstate'
import {
  COLS,
  DEFAULT_OPTIONS,
  formatElapsed,
  gameMachine,
  getExamplePuzzle,
  LETTER_SYSTEMS_LIST,
  type GameOptions,
} from '@/features/game/machine'

/*
 * Why this matters: formatElapsed is one line of code, but every timer and
 * results screen depends on its exact output ("1.2s", one decimal). A "small
 * cleanup" that rounds to whole seconds, swaps in Intl.NumberFormat, or
 * changes the unit silently changes every time displayed in the app. This
 * test makes such a change impossible to ship without an explicit decision.
 */
describe('formatElapsed', () => {
  test.each([
    { input: 0, expected: '0.0s' },
    { input: 1234, expected: '1.2s' },
    { input: 60_000, expected: '60.0s' },
  ])('formats $input ms as "$expected"', ({ input, expected }) => {
    expect(formatElapsed(input)).toBe(expected)
  })
})

/*
 * Why this matters: the Intro screen teaches the player by showing a worked
 * example whose correct answer is always "3 matches". That promise is encoded
 * across 7 hand-built EXAMPLE_PUZZLES entries — kana and emoji included. A
 * future edit to any non-Latin entry could easily introduce a 4-match row or
 * a mismatch in the wrong column, and the intro would teach a wrong example
 * with no compile error. This test enforces the shape for every system at
 * once, so editing the table can't silently break the tutorial.
 */
describe('getExamplePuzzle', () => {
  test.each(LETTER_SYSTEMS_LIST.map((system) => ({ system })))(
    'returns a 4-column example for $system with mismatch in last column',
    ({ system }) => {
      const { top, bottom, matches } = getExamplePuzzle(system)

      expect(top).toHaveLength(COLS)
      expect(bottom).toHaveLength(COLS)
      expect(matches).toHaveLength(COLS)
      /* Cols 0-2 match, col 3 mismatches — so highlightIdx=3 is always correct. */
      expect(matches).toEqual([true, true, true, false])
    },
  )
})

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
describe('generateRound - invariants', () => {
  test.each(LETTER_SYSTEMS_LIST.map((system) => ({ system })))(
    'generates valid rounds for $system across 50 samples',
    ({ system }) => {
      const options: GameOptions = {
        ...DEFAULT_OPTIONS,
        letterSystem: system,
        countTarget: 50,
      }
      const actor = createActor(gameMachine)
      actor.start()
      actor.send({ type: 'START', options })
      const { rounds } = actor.getSnapshot().context
      actor.stop()

      expect(rounds).toHaveLength(50)

      for (const round of rounds) {
        expect(round.top).toHaveLength(COLS)
        expect(round.bottom).toHaveLength(COLS)
        expect(round.matches).toHaveLength(COLS)
        expect(round.answer).toBe(round.matches.filter(Boolean).length)
        expect(round.answer).toBeGreaterThanOrEqual(0)
        expect(round.answer).toBeLessThanOrEqual(COLS)
      }
    },
  )
})

/*
 * Why this matters: end-to-end happy path for the primary user flow. Walks
 * the machine idle → playing → finished, asserting state transitions AND the
 * correct-answer counter at every step. A single test guards against the
 * broadest class of regressions: did anyone break START, ANSWER, the
 * isCountComplete guard, the correct counter, or the answers array? Any one
 * of those is catastrophic for the game, and they're all locked in here.
 *
 * The "wrong answers" partner test is critical alongside the happy path: a
 * subtle bug in the isCorrect check (`!==` instead of `===`, or comparing
 * the wrong field) would still pass the happy path because every answer is
 * correct. Submitting deliberately wrong values and asserting score stays
 * at 0 proves the scoring is actually conditional, not just an increment.
 */
describe('gameMachine - count mode flow', () => {
  test('should walk from idle through playing to finished and count correct answers', () => {
    const actor = createActor(gameMachine)
    actor.start()

    expect(actor.getSnapshot().value).toBe('idle')

    actor.send({
      type: 'START',
      options: {
        ...DEFAULT_OPTIONS,
        mode: 'count',
        countTarget: 3,
      },
    })

    expect(actor.getSnapshot().value).toBe('playing')
    expect(actor.getSnapshot().context.rounds).toHaveLength(3)

    /* Submit the correct answer for each round so we can assert correct === 3. */
    for (let i = 0; i < 3; i++) {
      const { rounds, current } = actor.getSnapshot().context
      actor.send({ type: 'ANSWER', value: rounds[current].answer })
    }

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe('finished')
    expect(snapshot.context.correct).toBe(3)
    expect(snapshot.context.answers).toHaveLength(3)

    actor.stop()
  })

  test('should not count wrong answers', () => {
    const actor = createActor(gameMachine)
    actor.start()
    actor.send({
      type: 'START',
      options: { ...DEFAULT_OPTIONS, mode: 'count', countTarget: 2 },
    })

    for (let i = 0; i < 2; i++) {
      const { rounds, current } = actor.getSnapshot().context
      /* (answer + 1) mod 5 is guaranteed to differ from the true answer in [0..4]. */
      const wrong = (rounds[current].answer + 1) % (COLS + 1)
      actor.send({ type: 'ANSWER', value: wrong })
    }

    expect(actor.getSnapshot().context.correct).toBe(0)
    actor.stop()
  })
})

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
describe('gameMachine - time mode lazy rounds', () => {
  test('should extend the rounds buffer when crossing its boundary', () => {
    const actor = createActor(gameMachine)
    actor.start()
    actor.send({
      type: 'START',
      options: { ...DEFAULT_OPTIONS, mode: 'time', timeLimitMs: 60_000 },
    })

    const initialLength = actor.getSnapshot().context.rounds.length
    expect(initialLength).toBeGreaterThan(0)

    /* Answering once should not yet grow the buffer (next < length). */
    actor.send({ type: 'ANSWER', value: 0 })
    expect(actor.getSnapshot().context.rounds.length).toBe(initialLength)

    /* Drain to the boundary so the next answer triggers a lazy push. */
    while (actor.getSnapshot().context.current < initialLength - 1) {
      actor.send({ type: 'ANSWER', value: 0 })
    }
    actor.send({ type: 'ANSWER', value: 0 })

    expect(actor.getSnapshot().context.rounds.length).toBe(initialLength + 1)
    actor.stop()
  })
})
