import { css, keyframes } from '@emotion/react';
import { cn } from './lib/utils';

const buttonClick = keyframes`
  0%   { transform: scale(1);    background-color: transparent; }
  40%  { transform: scale(0.92); background-color: oklch(0.205 0 0 / 0.12); }
  100% { transform: scale(1);    background-color: transparent; }
`;

const buttonClickStyle = css`
  &[data-clicked='true'] {
    animation: ${buttonClick} 180ms ease-out;
  }
`;

const CHOICES = [0, 1, 2, 3, 4];

type AnswerButtonsProps = {
  /** Click handler for play mode. Omit for a static preview (intro example). */
  onAnswer?: (n: number) => void;
  /** Highlights this choice as the correct answer (green). Used by the intro example. */
  highlightIdx?: number;
  className?: string;
};

export function AnswerButtons({
  onAnswer,
  highlightIdx,
  className,
}: AnswerButtonsProps) {
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const isPreview = !onAnswer;

  return (
    <div
      className={cn(
        'flex w-full max-w-md justify-around gap-1',
        isPreview && 'pointer-events-none',
        className,
      )}
    >
      {CHOICES.map((n) => (
        <Button
          key={n}
          variant="outline"
          size="xl"
          onClick={
            onAnswer
              ? () => {
                  setClickedIdx(n);
                  onAnswer(n);
                }
              : undefined
          }
          css={buttonClickStyle}
          data-clicked={clickedIdx === n ? 'true' : undefined}
          onAnimationEnd={() => setClickedIdx((c) => (c === n ? null : c))}
          className={cn(
            'w-12',
            n === highlightIdx &&
              'border-emerald-500 bg-emerald-50 font-semibold text-emerald-700',
          )}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}
