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
  return `${(ms / 1000).toFixed(1)}s`;
}

type LetterPair = readonly [string, string];

export type LetterSystem =
  | 'english'
  | 'german'
  | 'accented'
  | 'greek'
  | 'cyrillic'
  | 'kana'
  | 'emoji';

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

/*
 * Emoji "case" pairs — first form is the source/early state, second is the
 * product/later state. Asking the player to match them tests the same
 * perceptual-speed skill while adding a light memory layer.
 */
const EMOJI: LetterPair[] = [
  ['🥚', '🐣'],
  ['🐛', '🦋'],
  ['🌱', '🌳'],
  ['🌑', '🌕'],
  ['❄️', '⛄'],
  ['🌧️', '🌈'],
  ['🐄', '🥛'],
  ['🐝', '🍯'],
  ['🐑', '🧶'],
  ['🌾', '🍞'],
  ['🍇', '🍷'],
  ['🌽', '🍿'],
  ['🐟', '🍣'],
  ['🥔', '🍟'],
  ['🍅', '🍝'],
  ['☀️', '🌻'],
  ['🍎', '🥧'],
  ['🌹', '💐'],
];

export const LETTER_SYSTEMS: Record<LetterSystem, LetterPair[]> = {
  english: fromString('abcdefghijklmnopqrstuvwxyz'),
  german: fromString('abcdefghijklmnopqrstuvwxyzäöü'),
  accented: fromString('abcdefghijklmnopqrstuvwxyzåäöæøéèçñ'),
  greek: fromString('αβγδεζηθικλμνξοπρστυφχψω'),
  cyrillic: fromString('абвгдеёжзийклмнопрстуфхцчшщъыьэюя'),
  kana: KANA,
  emoji: EMOJI,
};

/*
 * Hand-picked 4-column example per letter system for the Intro screen.
 * Each example has 3 matching columns and 1 mismatch in column 3, so
 * highlightIdx=3 (the "3 matches" answer button) is always correct.
 * Letters are chosen to be distinctive — e.g. umlauts for German — so
 * the preview clearly reflects the user's selected system.
 */
const EXAMPLE_PUZZLES: Record<
  LetterSystem,
  { top: string[]; bottom: string[] }
> = {
  english: { top: ['a', 'b', 'c', 'd'], bottom: ['A', 'B', 'C', 'E'] },
  german: { top: ['a', 'ä', 'ö', 'ü'], bottom: ['A', 'Ä', 'Ö', 'B'] },
  accented: { top: ['å', 'ä', 'ø', 'ñ'], bottom: ['Å', 'Ä', 'Ø', 'É'] },
  greek: { top: ['α', 'β', 'γ', 'δ'], bottom: ['Α', 'Β', 'Γ', 'Ζ'] },
  cyrillic: { top: ['а', 'б', 'в', 'г'], bottom: ['А', 'Б', 'В', 'Д'] },
  kana: { top: ['あ', 'い', 'う', 'え'], bottom: ['ア', 'イ', 'ウ', 'オ'] },
  emoji: {
    top: ['🥚', '🐛', '🌱', '🐄'],
    bottom: ['🐣', '🦋', '🌳', '🍯'],
  },
};

/*
 * Examples are hand-built with the same shape: cols 0–2 match, col 3 mismatches.
 * Returned explicitly so non-alphabetic systems (kana, emoji) don't depend on
 * LetterGrid's case-insensitive string fallback for highlighting.
 */
const EXAMPLE_MATCHES: boolean[] = [true, true, true, false];

export function getExamplePuzzle(system: LetterSystem): {
  top: string[];
  bottom: string[];
  matches: boolean[];
} {
  return { ...EXAMPLE_PUZZLES[system], matches: EXAMPLE_MATCHES };
}

export const LETTER_SYSTEMS_LIST: readonly LetterSystem[] = [
  'english',
  'german',
  'accented',
  'greek',
  'cyrillic',
  'kana',
  'emoji',
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
  mirrorX: boolean;
  mirrorY: boolean;
  letterSystem: LetterSystem;
};

export type GameOptions = Pick<
  GameContext,
  | 'mode'
  | 'countTarget'
  | 'timeLimitMs'
  | 'showTimer'
  | 'mirrorX'
  | 'mirrorY'
  | 'letterSystem'
>;

export const DEFAULT_OPTIONS: GameOptions = {
  mode: 'count',
  countTarget: DEFAULT_COUNT_TARGET,
  timeLimitMs: DEFAULT_TIME_LIMIT_MS,
  showTimer: false,
  mirrorX: false,
  mirrorY: false,
  letterSystem: 'english',
};

type GameEvent =
  | { type: 'START'; options: GameOptions }
  | { type: 'ANSWER'; value: number }
  | { type: 'ABORT' }
  | { type: 'RESTART' };

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
  },
  actions: {
    /* Snapshot options off the START event so mid-game store changes don't affect the running session. */
    initGame: assign(({ event }) => {
      if (event.type !== 'START') return {};
      const { options } = event;

      return {
        ...options,
        rounds: Array.from(
          {
            length:
              options.mode === 'count'
                ? options.countTarget
                : TIME_MODE_ROUND_BUFFER,
          },
          () => generateRound(options.letterSystem),
        ),
        answers: [],
        current: 0,
        correct: 0,
        startedAt: Date.now(),
        elapsedMs: 0,
      };
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
  initial: 'idle',
  context: {
    rounds: [],
    answers: [],
    current: 0,
    correct: 0,
    startedAt: 0,
    elapsedMs: 0,
    /* Placeholder snapshot — overwritten by initGame on START. */
    ...DEFAULT_OPTIONS,
  },
  states: {
    idle: {
      on: {
        START: { target: 'playing', actions: 'initGame' },
      },
    },
    playing: {
      after: {
        timeLimit: {
          guard: 'isTimeMode',
          target: 'finished',
          actions: 'finalizeTime',
        },
      },
      on: {
        ANSWER: [
          {
            guard: 'isCountComplete',
            target: 'finished',
            actions: 'recordAnswer',
          },
          /* Internal transition (no target) — avoids re-entering `playing` and resetting the `after` timer. */
          { actions: 'recordAnswer' },
        ],
        ABORT: { target: 'idle' },
      },
    },
    finished: {
      on: {
        RESTART: { target: 'idle' },
      },
    },
  },
});
