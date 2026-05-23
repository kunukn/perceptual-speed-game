import { COLS } from './Game';
import { formatTimeLimit, type GameMode } from './gameMachine';
import { PuzzleBoard } from './PuzzleBoard';

type Props = {
  mode: GameMode;
  countTarget: number;
  timeLimitMs: number;
  onStart: () => void;
  onOpenOptions: () => void;
};

export function GameIntro({
  mode,
  countTarget,
  timeLimitMs,
  onStart,
  onOpenOptions,
}: Props) {
  return (
    <div className="max-w-md space-y-3 text-slate-700 md:space-y-4">
      <h2 className="text-center text-lg font-semibold text-slate-900">
        How to play
      </h2>
      <p className="text-sm md:text-center md:text-base">
        Two rows of {COLS} letters — one uppercase, one lowercase. Count the
        columns where the letters match, then tap that number.
      </p>

      <PuzzleBoard
        label="Example"
        top={['a', 'b', 'c', 'd']}
        bottom={['A', 'B', 'C', 'E']}
        showMatches
        showColumnOutlines
        highlightIdx={3}
        caption="3 pairs match — the correct answer is 3"
      />

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
          ? `${formatTimeLimit(timeLimitMs)}. We track how many you answer and how many you got right.`
          : `${countTarget} rounds. We track your time and how many you got right.`}
      </p>
    </div>
  );
}
