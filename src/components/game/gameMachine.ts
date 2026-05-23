import { assign, setup } from 'xstate';

export const COLS = 4;
export const COUNT_TARGETS = [5, 10, 15, 20, 30] as const;
export const TIME_LIMITS_MS = [10_000, 30_000, 60_000, 120_000] as const;

const DEFAULT_COUNT_TARGET = 5;
const DEFAULT_TIME_LIMIT_MS = 60_000;
/* Initial round buffer for time mode — lazily extended as the player runs out. */
const TIME_MODE_ROUND_BUFFER = 10;

export type GameMode = 'count' | 'time';

export function formatElapsed(ms: number): string {
  return `${Math.round(ms / 1000)}s`;
}

type LetterPair = readonly [string, string];

export type LetterSystem =
  | 'english'
  | 'german'
  | 'accented'
  | 'greek'
  | 'cyrillic'
  | 'kana';

/* Build case pairs from a lowercase string — partner glyph is the uppercase form. */
function fromString(lower: string): LetterPair[] {
  return [...lower].map((c) => [c, c.toUpperCase()] as const);
}

/* Hiragana paired with the katakana of the same syllable — kana has no case. */
const KANA: LetterPair[] = [
  ['あ', 'ア'],
  ['い', 'イ'],
  ['う', 'ウ'],
  ['え', 'エ'],
  ['お', 'オ'],
  ['か', 'カ'],
  ['き', 'キ'],
  ['く', 'ク'],
  ['け', 'ケ'],
  ['こ', 'コ'],
  ['さ', 'サ'],
  ['し', 'シ'],
  ['す', 'ス'],
  ['せ', 'セ'],
  ['そ', 'ソ'],
  ['た', 'タ'],
  ['ち', 'チ'],
  ['つ', 'ツ'],
  ['て', 'テ'],
  ['と', 'ト'],
  ['な', 'ナ'],
  ['に', 'ニ'],
  ['ぬ', 'ヌ'],
  ['ね', 'ネ'],
  ['の', 'ノ'],
  ['は', 'ハ'],
  ['ひ', 'ヒ'],
  ['ふ', 'フ'],
  ['へ', 'ヘ'],
  ['ほ', 'ホ'],
  ['ま', 'マ'],
  ['み', 'ミ'],
  ['む', 'ム'],
  ['め', 'メ'],
  ['も', 'モ'],
  ['や', 'ヤ'],
  ['ゆ', 'ユ'],
  ['よ', 'ヨ'],
  ['ら', 'ラ'],
  ['り', 'リ'],
  ['る', 'ル'],
  ['れ', 'レ'],
  ['ろ', 'ロ'],
  ['わ', 'ワ'],
  ['を', 'ヲ'],
  ['ん', 'ン'],
];

const LETTER_SYSTEMS: Record<LetterSystem, LetterPair[]> = {
  english: fromString('abcdefghijklmnopqrstuvwxyz'),
  german: fromString('abcdefghijklmnopqrstuvwxyzäöü'),
  accented: fromString('abcdefghijklmnopqrstuvwxyzåäöæøéèçñ'),
  greek: fromString('αβγδεζηθικλμνξοπρστυφχψω'),
  cyrillic: fromString('абвгдеёжзийклмнопрстуфхцчшщъыьэюя'),
  kana: KANA,
};

export const LETTER_SYSTEMS_LIST: readonly LetterSystem[] = [
  'english',
  'german',
  'accented',
  'greek',
  'cyrillic',
  'kana',
];

export type Round = {
  top: string[];
  bottom: string[];
  answer: number;
  matches: boolean[];
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
  showTimer: boolean;
  letterSystem: LetterSystem;
};

export type GameOptions = Pick<
  GameContext,
  'mode' | 'countTarget' | 'timeLimitMs' | 'showTimer' | 'letterSystem'
>;

export const DEFAULT_OPTIONS: GameOptions = {
  mode: 'count',
  countTarget: DEFAULT_COUNT_TARGET,
  timeLimitMs: DEFAULT_TIME_LIMIT_MS,
  showTimer: false,
  letterSystem: 'english',
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
  | { type: 'SET_TIME_LIMIT'; value: number }
  | { type: 'SET_SHOW_TIMER'; value: boolean }
  | { type: 'SET_LETTER_SYSTEM'; value: LetterSystem };

/* Pick a random pair index, optionally avoiding already-used pairs. */
function randPair(pairs: LetterPair[], exclude?: Set<number>): number {
  while (true) {
    const i = Math.floor(Math.random() * pairs.length);
    if (!exclude || !exclude.has(i)) return i;
  }
}

function generateRound(system: LetterSystem): Round {
  const pairs = LETTER_SYSTEMS[system];
  const target = Math.floor(Math.random() * (COLS + 1));
  const matchCols = new Set<number>();
  while (matchCols.size < target) {
    matchCols.add(Math.floor(Math.random() * COLS));
  }

  const topIsFormA = Math.random() < 0.5;
  const top: string[] = [];
  const bottom: string[] = [];
  const matches: boolean[] = [];
  const used = new Set<number>();

  for (let i = 0; i < COLS; i++) {
    const a = randPair(pairs, used);
    used.add(a);
    let b: number;
    if (matchCols.has(i)) {
      b = a;
    } else {
      b = randPair(pairs, used);
      used.add(b);
    }
    /* Same pair, opposite form = a matching column; different pairs = no match. */
    top.push(topIsFormA ? pairs[a][0] : pairs[a][1]);
    bottom.push(topIsFormA ? pairs[b][1] : pairs[b][0]);
    matches.push(matchCols.has(i));
  }

  return { top, bottom, answer: target, matches };
}

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    input: {} as GameOptions,
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
        () => generateRound(context.letterSystem),
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
    setShowTimer: assign(({ event }) => {
      if (event.type !== 'SET_SHOW_TIMER') return {};

      return { showTimer: event.value };
    }),
    setLetterSystem: assign(({ event }) => {
      if (event.type !== 'SET_LETTER_SYSTEM') return {};

      return { letterSystem: event.value };
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
            ? [...context.rounds, generateRound(context.letterSystem)]
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
  context: ({ input }) => ({
    rounds: [],
    answers: [],
    current: 0,
    correct: 0,
    startedAt: 0,
    elapsedMs: 0,
    /* Defaults first so a stale localStorage save missing newer fields still boots. */
    ...DEFAULT_OPTIONS,
    ...input,
  }),
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
        SET_SHOW_TIMER: { actions: 'setShowTimer' },
        SET_LETTER_SYSTEM: { actions: 'setLetterSystem' },
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
