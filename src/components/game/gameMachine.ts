import { assign, setup } from 'xstate';

export const COLS = 4;
export const COUNT_TARGETS = [10, 20] as const;
export const TIME_LIMITS_MS = [30_000, 60_000] as const;

const DEFAULT_COUNT_TARGET = 10;
const DEFAULT_TIME_LIMIT_MS = 60_000;
/* Initial round buffer for time mode — lazily extended as the player runs out. */
const TIME_MODE_ROUND_BUFFER = 10;

export type GameMode = 'count' | 'time';

export function formatTimeLimit(ms: number): string {
  if (ms === 60_000) return '1 minute';

  return `${ms / 1000} seconds`;
}

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
  countTarget: number;
  timeLimitMs: number;
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
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_COUNT_TARGET'; value: number }
  | { type: 'SET_TIME_LIMIT'; value: number };

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
    initGame: assign(({ context }) => ({
      rounds: Array.from(
        {
          length:
            context.mode === 'count'
              ? context.countTarget
              : TIME_MODE_ROUND_BUFFER,
        },
        generateRound,
      ),
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
    setCountTarget: assign(({ event }) => {
      if (event.type !== 'SET_COUNT_TARGET') return {};

      return { countTarget: event.value };
    }),
    setTimeLimit: assign(({ event }) => {
      if (event.type !== 'SET_TIME_LIMIT') return {};

      return { timeLimitMs: event.value };
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
      context.mode === 'count' && context.current + 1 >= context.countTarget,
    isTimeMode: ({ context }) => context.mode === 'time',
  },
  delays: {
    timeLimit: ({ context }) => context.timeLimitMs,
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
    countTarget: DEFAULT_COUNT_TARGET,
    timeLimitMs: DEFAULT_TIME_LIMIT_MS,
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
        SET_COUNT_TARGET: { actions: 'setCountTarget' },
        SET_TIME_LIMIT: { actions: 'setTimeLimit' },
      },
    },
    playing: {
      after: {
        timeLimit: {
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
