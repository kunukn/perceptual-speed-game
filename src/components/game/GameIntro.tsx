import { COLS, TOTAL_ROUNDS } from './Game';
import type { GameMode } from './gameMachine';
import { PuzzleBoard } from './PuzzleBoard';

type Props = {
  mode: GameMode;
  onStart: () => void;
  onOpenOptions: () => void;
};

export function GameIntro({ mode, onStart, onOpenOptions }: Props) {
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
      <div className="flex justify-center">
        {/*
        <Badge variant="secondary">
          Mode: {mode === 'time' ? 'Time' : 'Count'}
        </Badge>
        */}
      </div>
      <div className="mx-auto flex max-w-68 gap-2">
        <Button
          className="flex-1"
          size="lg"
          variant="outline"
          onClick={onOpenOptions}
        >
          Options
        </Button>
        <Button className="flex-1" size="lg" onClick={onStart}>
          Start
        </Button>
      </div>
      <p>
        {mode === 'time'
          ? '1 minute. We track how many you answer and how many you got right.'
          : `${TOTAL_ROUNDS} rounds. We track your time and how many you got right.`}
      </p>
    </div>
  );
}
