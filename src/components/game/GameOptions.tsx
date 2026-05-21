import type { GameMode } from './gameMachine';

type Props = {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onBack: () => void;
};

export function GameOptions({ mode, onModeChange, onBack }: Props) {
  return (
    <div className="max-w-md space-y-6 text-slate-700">
      <h2 className="text-center text-lg font-semibold text-slate-900">
        Options
      </h2>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900">
          Game mode
        </legend>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="gameMode"
            value="count"
            checked={mode === 'count'}
            onChange={() => onModeChange('count')}
            className="accent-slate-800"
          />
          <span className="text-sm">
            <span className="font-medium">Count mode</span> — answer{' '}
            10&nbsp;questions
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name="gameMode"
            value="time"
            checked={mode === 'time'}
            onChange={() => onModeChange('time')}
            className="accent-slate-800"
          />
          <span className="text-sm">
            <span className="font-medium">Time mode</span> — answer as many as
            you can in 1&nbsp;minute
          </span>
        </label>
      </fieldset>

      <div className="flex">
        <Button
          className="mx-auto w-60 max-w-full"
          size="lg"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
