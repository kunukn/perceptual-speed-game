import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameMode, LetterSystem } from '@/features/game/machine';

export type HighScore = {
  key: string;
  mode: GameMode;
  countTarget: number;
  timeLimitMs: number;
  letterSystem: LetterSystem;
  mirrorX: boolean;
  mirrorY: boolean;
  correct: number;
  answered: number;
  elapsedMs: number;
  achievedAt: number;
};

export type HighScoreVariant = Pick<
  HighScore,
  | 'mode'
  | 'countTarget'
  | 'timeLimitMs'
  | 'letterSystem'
  | 'mirrorX'
  | 'mirrorY'
>;

export function highScoreKey(o: HighScoreVariant): string {
  const variant =
    o.mode === 'count' ? `count:${o.countTarget}` : `time:${o.timeLimitMs}`;

  return `${variant}|${o.letterSystem}|x${o.mirrorX ? 1 : 0}|y${o.mirrorY ? 1 : 0}`;
}

/* Returns true if `candidate` is strictly better than `current`. */
function isBetter(candidate: HighScore, current: HighScore): boolean {
  if (candidate.correct !== current.correct)
    return candidate.correct > current.correct;

  if (candidate.mode === 'count')
    return candidate.elapsedMs < current.elapsedMs;

  return candidate.answered < current.answered;
}

type HighScoresStore = {
  scores: Record<string, HighScore>;
  recordScore: (input: Omit<HighScore, 'key' | 'achievedAt'>) => void;
  clear: () => void;
};

export const useHighScores = create<HighScoresStore>()(
  persist(
    (set) => ({
      scores: {},
      recordScore: (input) =>
        set((state) => {
          const key = highScoreKey(input);
          const candidate: HighScore = {
            ...input,
            key,
            achievedAt: Date.now(),
          };
          const current = state.scores[key];
          if (current && !isBetter(candidate, current)) return state;

          return { scores: { ...state.scores, [key]: candidate } };
        }),
      clear: () => set({ scores: {} }),
    }),
    { name: 'high-scores' },
  ),
);
