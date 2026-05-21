import type { ReactNode } from 'react';
import { AnswerButtons } from './AnswerButtons';
import { LetterGrid } from './LetterGrid';

type PuzzleBoardProps = {
  /** Header label above the grid — e.g. "Example" or "Round 03 / 10". */
  label: ReactNode;
  top: string[];
  bottom: string[];
  /** Color matching letter columns green — intro example only. */
  showMatches?: boolean;
  /** Click handler for play mode. Omit for a static preview (intro example). */
  onAnswer?: (n: number) => void;
  /** Highlights this choice as the correct answer (green). */
  highlightIdx?: number;
  /** Caption shown below the answer buttons (intro example only). */
  caption?: ReactNode;
};

export function PuzzleBoard({
  label,
  top,
  bottom,
  showMatches,
  onAnswer,
  highlightIdx,
  caption,
}: PuzzleBoardProps) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="text-sm text-slate-500 tabular-nums">{label}</div>

      <hr className="w-full border-slate-200" />

      <LetterGrid
        top={top}
        bottom={bottom}
        showMatches={showMatches}
        className="font-mono text-4xl"
      />

      <hr className="w-full border-slate-200" />

      <p className="leading-none">Answer:</p>

      <div className="flex flex-col items-center gap-3">
        <AnswerButtons onAnswer={onAnswer} highlightIdx={highlightIdx} />
        {caption && (
          <p className="text-center text-sm font-medium text-emerald-700">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
