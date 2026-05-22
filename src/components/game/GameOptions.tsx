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
  showTimer: boolean;
  onModeChange: (mode: GameMode) => void;
  onCountTargetChange: (value: number) => void;
  onTimeLimitChange: (value: number) => void;
  onShowTimerChange: (value: boolean) => void;
  onBack: () => void;
};

export function GameOptions({
  mode,
  countTarget,
  timeLimitMs,
  showTimer,
  onModeChange,
  onCountTargetChange,
  onTimeLimitChange,
  onShowTimerChange,
  onBack,
}: Props) {
  const options = [
    ...TIME_LIMITS_MS.map((ms) => ({
      key: `time-${ms}`,
      label: formatTimeLimit(ms),
      checked: mode === 'time' && timeLimitMs === ms,
      select: () => {
        onModeChange('time');
        onTimeLimitChange(ms);
      },
    })),
    ...COUNT_TARGETS.map((count) => ({
      key: `count-${count}`,
      label: `${count} questions`,
      checked: mode === 'count' && countTarget === count,
      select: () => {
        onModeChange('count');
        onCountTargetChange(count);
      },
    })),
  ];

  return (
    <div className="max-w-md space-y-6 text-slate-700">
      <h2 className="text-center text-lg font-semibold text-slate-900">
        Options
      </h2>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900">
          Game mode
        </legend>

        {options.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              name="gameOption"
              checked={option.checked}
              onChange={option.select}
              className="accent-slate-800"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={showTimer}
          onChange={(e) => onShowTimerChange(e.target.checked)}
          className="accent-slate-800"
        />
        <span className="text-sm">Show time spent during play</span>
      </label>

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
