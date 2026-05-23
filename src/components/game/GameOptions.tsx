import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

import {
  COUNT_TARGETS,
  formatTimeLimit,
  LETTER_SYSTEM_LABELS,
  TIME_LIMITS_MS,
  type GameMode,
  type LetterSystem,
} from './gameMachine';

type Props = {
  mode: GameMode;
  countTarget: number;
  timeLimitMs: number;
  showTimer: boolean;
  letterSystem: LetterSystem;
  onModeChange: (mode: GameMode) => void;
  onCountTargetChange: (value: number) => void;
  onTimeLimitChange: (value: number) => void;
  onShowTimerChange: (value: boolean) => void;
  onLetterSystemChange: (value: LetterSystem) => void;
  onBack: () => void;
};

export function GameOptions({
  mode,
  countTarget,
  timeLimitMs,
  showTimer,
  letterSystem,
  onModeChange,
  onCountTargetChange,
  onTimeLimitChange,
  onShowTimerChange,
  onLetterSystemChange,
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

  const selectedGameOption = options.find((option) => option.checked)?.key;

  const handleGameOptionChange = (value: string) => {
    const next = options.find((option) => option.key === value);
    next?.select();
  };

  return (
    <div className="max-w-md space-y-6 text-slate-700">
      <h2 className="text-center text-lg font-semibold text-slate-900">
        Options
      </h2>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900">
          Game mode
        </legend>

        <RadioGroup
          value={selectedGameOption}
          onValueChange={handleGameOptionChange}
          className="gap-3"
        >
          {options.map((option) => (
            <div key={option.key} className="flex items-center gap-3">
              <RadioGroupItem id={option.key} value={option.key} />
              <Label htmlFor={option.key} className="text-sm font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-900">Letters</legend>

        <RadioGroup
          value={letterSystem}
          onValueChange={(value) => onLetterSystemChange(value as LetterSystem)}
          className="gap-3"
        >
          {(Object.keys(LETTER_SYSTEM_LABELS) as LetterSystem[]).map(
            (system) => (
              <div key={system} className="flex items-center gap-3">
                <RadioGroupItem id={`letters-${system}`} value={system} />
                <Label
                  htmlFor={`letters-${system}`}
                  className="text-sm font-normal"
                >
                  {LETTER_SYSTEM_LABELS[system]}
                </Label>
              </div>
            ),
          )}
        </RadioGroup>
      </fieldset>

      <div className="flex items-center gap-3">
        <Switch
          id="show-timer"
          checked={showTimer}
          onCheckedChange={onShowTimerChange}
        />
        <Label htmlFor="show-timer" className="text-sm font-normal">
          Show time spent during play
        </Label>
      </div>

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
