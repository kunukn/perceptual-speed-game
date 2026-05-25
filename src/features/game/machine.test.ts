import { createActor } from 'xstate';
import {
  COLS,
  DEFAULT_OPTIONS,
  formatElapsed,
  gameMachine,
  getExamplePuzzle,
  LETTER_SYSTEMS_LIST,
  type GameOptions,
} from '@/features/game/machine';

describe('formatElapsed', () => {
  test.each([
    { input: 0, expected: '0.0s' },
    { input: 1234, expected: '1.2s' },
    { input: 60_000, expected: '60.0s' },
  ])('formats $input ms as "$expected"', ({ input, expected }) => {
    expect(formatElapsed(input)).toBe(expected);
  });
});

describe('getExamplePuzzle', () => {
  test.each(LETTER_SYSTEMS_LIST.map((system) => ({ system })))(
    'returns a 4-column example for $system with mismatch in last column',
    ({ system }) => {
      const { top, bottom, matches } = getExamplePuzzle(system);

      expect(top).toHaveLength(COLS);
      expect(bottom).toHaveLength(COLS);
      expect(matches).toHaveLength(COLS);
      /* Cols 0-2 match, col 3 mismatches — so highlightIdx=3 is always correct. */
      expect(matches).toEqual([true, true, true, false]);
    },
  );
});

describe('generateRound - invariants', () => {
  /*
   * generateRound is non-deterministic. Instead of seeding RNG we sample many
   * rounds and assert the structural invariants that must always hold.
   */
  test.each(LETTER_SYSTEMS_LIST.map((system) => ({ system })))(
    'generates valid rounds for $system across 50 samples',
    ({ system }) => {
      const options: GameOptions = {
        ...DEFAULT_OPTIONS,
        letterSystem: system,
        countTarget: 50,
      };
      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: 'START', options });
      const { rounds } = actor.getSnapshot().context;
      actor.stop();

      expect(rounds).toHaveLength(50);

      for (const round of rounds) {
        expect(round.top).toHaveLength(COLS);
        expect(round.bottom).toHaveLength(COLS);
        expect(round.matches).toHaveLength(COLS);
        expect(round.answer).toBe(round.matches.filter(Boolean).length);
        expect(round.answer).toBeGreaterThanOrEqual(0);
        expect(round.answer).toBeLessThanOrEqual(COLS);
      }
    },
  );
});

describe('gameMachine - count mode flow', () => {
  test('should walk from idle through playing to finished and count correct answers', () => {
    const actor = createActor(gameMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');

    actor.send({
      type: 'START',
      options: {
        ...DEFAULT_OPTIONS,
        mode: 'count',
        countTarget: 3,
      },
    });

    expect(actor.getSnapshot().value).toBe('playing');
    expect(actor.getSnapshot().context.rounds).toHaveLength(3);

    /* Submit the correct answer for each round so we can assert correct === 3. */
    for (let i = 0; i < 3; i++) {
      const { rounds, current } = actor.getSnapshot().context;
      actor.send({ type: 'ANSWER', value: rounds[current].answer });
    }

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('finished');
    expect(snapshot.context.correct).toBe(3);
    expect(snapshot.context.answers).toHaveLength(3);

    actor.stop();
  });

  test('should not count wrong answers', () => {
    const actor = createActor(gameMachine);
    actor.start();
    actor.send({
      type: 'START',
      options: { ...DEFAULT_OPTIONS, mode: 'count', countTarget: 2 },
    });

    for (let i = 0; i < 2; i++) {
      const { rounds, current } = actor.getSnapshot().context;
      /* (answer + 1) mod 5 is guaranteed to differ from the true answer in [0..4]. */
      const wrong = (rounds[current].answer + 1) % (COLS + 1);
      actor.send({ type: 'ANSWER', value: wrong });
    }

    expect(actor.getSnapshot().context.correct).toBe(0);
    actor.stop();
  });
});

describe('gameMachine - time mode lazy rounds', () => {
  test('should extend the rounds buffer when crossing its boundary', () => {
    const actor = createActor(gameMachine);
    actor.start();
    actor.send({
      type: 'START',
      options: { ...DEFAULT_OPTIONS, mode: 'time', timeLimitMs: 60_000 },
    });

    const initialLength = actor.getSnapshot().context.rounds.length;
    expect(initialLength).toBeGreaterThan(0);

    /* Answering once should not yet grow the buffer (next < length). */
    actor.send({ type: 'ANSWER', value: 0 });
    expect(actor.getSnapshot().context.rounds.length).toBe(initialLength);

    /* Drain to the boundary so the next answer triggers a lazy push. */
    while (actor.getSnapshot().context.current < initialLength - 1) {
      actor.send({ type: 'ANSWER', value: 0 });
    }
    actor.send({ type: 'ANSWER', value: 0 });

    expect(actor.getSnapshot().context.rounds.length).toBe(initialLength + 1);
    actor.stop();
  });
});

describe('gameMachine - ABORT', () => {
  test('should return to idle when playing is aborted', () => {
    const actor = createActor(gameMachine);
    actor.start();
    actor.send({ type: 'START', options: DEFAULT_OPTIONS });
    expect(actor.getSnapshot().value).toBe('playing');

    actor.send({ type: 'ABORT' });
    expect(actor.getSnapshot().value).toBe('idle');
    actor.stop();
  });
});
