import type { ReactNode } from 'react';
import { AnswerButtons } from './AnswerButtons';
import { LetterGrid } from './LetterGrid';

type PuzzleBoardProps = {
  /** Header label above the grid — e.g. "Example" or "Round 03 / 10". */
  label: ReactNode;
  top: string[];
  bottom: string[];
  /** Which columns are matching pairs — drives the green highlight. */
  matches?: boolean[];
  /** Color matching letter columns green — intro example only. */
  showMatches?: boolean;
  /** Thin outline around each column — intro + review. */
  showColumnOutlines?: boolean;
  /** Click handler for play mode. Omit for a static preview (intro example). */
  onAnswer?: (n: number) => void;
  /** Highlights this choice as the correct answer (green). */
  highlightIdx?: number;
  /** Highlights this choice as the wrong answer (red). Used by review mode. */
  wrongIdx?: number;
  /** Caption shown below the answer buttons (intro example only). */
  caption?: ReactNode;
};

export function PuzzleBoard({
  label,
  top,
  bottom,
  matches,
  showMatches,
  showColumnOutlines,
  onAnswer,
  highlightIdx,
  wrongIdx,
  caption,
}: PuzzleBoardProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4 md:gap-8">
      <div className="text-sm text-slate-500 tabular-nums">{label}</div>

      <hr className="w-full border-slate-200" />

      <LetterGrid
        top={top}
        bottom={bottom}
        matches={matches}
        showMatches={showMatches}
        showColumnOutlines={showColumnOutlines}
        className="font-mono text-4xl"
      />

      <hr className="w-full border-slate-200" />

      <p className="leading-none">Answer:</p>

      <div className="flex flex-col items-center gap-3">
        <AnswerButtons
          onAnswer={onAnswer}
          highlightIdx={highlightIdx}
          wrongIdx={wrongIdx}
        />
        {caption && (
          <p className="text-center text-sm font-medium text-emerald-700">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
