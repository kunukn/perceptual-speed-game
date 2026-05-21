import { COLS, TOTAL_ROUNDS } from './Game';
import { PuzzleBoard } from './PuzzleBoard';

type Props = { onStart: () => void };

export function GameIntro({ onStart }: Props) {
  return (
    <div className="max-w-md space-y-4 text-slate-700">
      <h2 className="text-center text-lg font-semibold text-slate-900">
        How to play
      </h2>
      <p className="text-sm md:text-center md:text-base">
        Two rows of {COLS} chars. One row is uppercase, the other lowercase.
        Count matching vertical letter pairs (case-insensitive). Press the
        button matching that count.
      </p>

      <PuzzleBoard
        label="Example"
        top={['a', 'b', 'c', 'd']}
        bottom={['A', 'B', 'C', 'E']}
        showMatches
        showColumnArrows
        highlightIdx={3}
        caption="3 pairs match — the correct answer is 3"
      />
      <div className="flex">
        <Button className="mx-auto w-60 max-w-full" size="lg" onClick={onStart}>
          Start
        </Button>
      </div>
      <p>
        {TOTAL_ROUNDS} rounds. We track your time and how many you got right.
      </p>
    </div>
  );
}
