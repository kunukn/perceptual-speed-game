import { assign, setup } from 'xstate';

export const TOTAL_ROUNDS = 10;
export const COLS = 4;
export const TIME_LIMIT_MS = 60_000;

export type GameMode = 'count' | 'time';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export type Round = {
  top: string[];
  bottom: string[];
  answer: number;
};

type GameContext = {
  rounds: Round[];
  answers: number[];
  current: number;
  correct: number;
  startedAt: number;
  elapsedMs: number;
  mode: GameMode;
};

type GameEvent =
  | { type: 'START' }
  | { type: 'ANSWER'; value: number }
  | { type: 'ABORT' }
  | { type: 'RESTART' }
  | { type: 'REVIEW' }
  | { type: 'EXIT_REVIEW' }
  | { type: 'OPEN_OPTIONS' }
  | { type: 'BACK_TO_INTRO' }
  | { type: 'SET_MODE'; mode: GameMode };

function randLetter(exclude?: Set<string>): string {
  while (true) {
    const c = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!exclude || !exclude.has(c)) return c;
  }
}

function generateRound(): Round {
  const target = Math.floor(Math.random() * (COLS + 1));
  const matchCols = new Set<number>();
  while (matchCols.size < target) {
    matchCols.add(Math.floor(Math.random() * COLS));
  }

  const topUpper = Math.random() < 0.5;
  const top: string[] = [];
  const bottom: string[] = [];
  const used = new Set<string>();

  for (let i = 0; i < COLS; i++) {
    const a = randLetter(used);
    used.add(a);
    let b: string;
    if (matchCols.has(i)) {
      b = a;
    } else {
      b = randLetter(used);
      used.add(b);
    }
    top.push(topUpper ? a.toUpperCase() : a);
    bottom.push(topUpper ? b : b.toUpperCase());
  }

  return { top, bottom, answer: target };
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actions: {
    initGame: assign(() => ({
      rounds: Array.from({ length: TOTAL_ROUNDS }, generateRound),
      answers: [],
      current: 0,
      correct: 0,
      startedAt: Date.now(),
      elapsedMs: 0,
    })),
    setMode: assign(({ event }) => {
      if (event.type !== 'SET_MODE') return {};
      return { mode: event.mode };
    }),
    recordAnswer: assign(({ context, event }) => {
      if (event.type !== 'ANSWER') return {};
      const isCorrect = event.value === context.rounds[context.current].answer;
      const next = context.current + 1;
      return {
        answers: [...context.answers, event.value],
        correct: context.correct + (isCorrect ? 1 : 0),
        current: next,
        elapsedMs: Date.now() - context.startedAt,
        /* Time mode is endless — generate the next round lazily so play never runs out. */
        rounds:
          context.mode === 'time' && next >= context.rounds.length
            ? [...context.rounds, generateRound()]
            : context.rounds,
      };
    }),
    finalizeTime: assign(({ context }) => ({
      elapsedMs: Date.now() - context.startedAt,
    })),
  },
  guards: {
    isCountComplete: ({ context }) =>
      context.mode === 'count' && context.current + 1 >= TOTAL_ROUNDS,
    isTimeMode: ({ context }) => context.mode === 'time',
  },
}).createMachine({
  id: 'game',
  initial: 'intro',
  context: {
    rounds: [],
    answers: [],
    current: 0,
    correct: 0,
    startedAt: 0,
    elapsedMs: 0,
    mode: 'count' as GameMode,
  },
  states: {
    intro: {
      on: {
        START: { target: 'playing', actions: 'initGame' },
        OPEN_OPTIONS: { target: 'options' },
      },
    },
    options: {
      on: {
        BACK_TO_INTRO: { target: 'intro' },
        SET_MODE: { actions: 'setMode' },
      },
    },
    playing: {
      after: {
        [TIME_LIMIT_MS]: {
          guard: 'isTimeMode',
          target: 'results',
          actions: 'finalizeTime',
        },
      },
      on: {
        ANSWER: [
          {
            guard: 'isCountComplete',
            target: 'results',
            actions: 'recordAnswer',
          },
          /* Internal transition (no target) — avoids re-entering `playing` and resetting the `after` timer. */
          { actions: 'recordAnswer' },
        ],
        ABORT: { target: 'intro' },
      },
    },
    results: {
      on: {
        RESTART: { target: 'intro' },
        REVIEW: { target: 'review' },
      },
    },
    review: {
      on: {
        EXIT_REVIEW: { target: 'results' },
      },
    },
  },
});
