import {
  COUNT_TARGETS,
  formatTimeLimit,
  TIME_LIMITS_MS,
  type GameMode,
} from './gameMachine';

type Props = {
  mode: GameMode;
  countTarget: number;
  timeLimitMs: number;
  onModeChange: (mode: GameMode) => void;
  onCountTargetChange: (value: number) => void;
  onTimeLimitChange: (value: number) => void;
  onBack: () => void;
};

export function GameOptions({
  mode,
  countTarget,
  timeLimitMs,
  onModeChange,
  onCountTargetChange,
  onTimeLimitChange,
  onBack,
}: Props) {
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
            <span className="font-medium">Count mode</span> — answer a fixed
            number of questions
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
            you can before time runs out
          </span>
        </label>
      </fieldset>

      {mode === 'count' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-900">
            Questions
          </legend>

          {COUNT_TARGETS.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="radio"
                name="countTarget"
                value={value}
                checked={countTarget === value}
                onChange={() => onCountTargetChange(value)}
                className="accent-slate-800"
              />
              <span className="text-sm">{value}&nbsp;questions</span>
            </label>
          ))}
        </fieldset>
      )}

      {mode === 'time' && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-900">
            Duration
          </legend>

          {TIME_LIMITS_MS.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="radio"
                name="timeLimit"
                value={value}
                checked={timeLimitMs === value}
                onChange={() => onTimeLimitChange(value)}
                className="accent-slate-800"
              />
              <span className="text-sm">{formatTimeLimit(value)}</span>
            </label>
          ))}
        </fieldset>
      )}

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
