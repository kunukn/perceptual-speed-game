import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

import {
  COUNT_TARGETS,
  LETTER_SYSTEMS_LIST,
  TIME_LIMITS_MS,
  type GameMode,
  type LetterSystem,
} from './gameMachine';

type Props = {
  mode: GameMode;
  countTarget: number;
  timeLimitMs: number;
  showTimer: boolean;
  mirrorX: boolean;
  mirrorY: boolean;
  letterSystem: LetterSystem;
  onModeChange: (mode: GameMode) => void;
  onCountTargetChange: (value: number) => void;
  onTimeLimitChange: (value: number) => void;
  onShowTimerChange: (value: boolean) => void;
  onMirrorXChange: (value: boolean) => void;
  onMirrorYChange: (value: boolean) => void;
  onLetterSystemChange: (value: LetterSystem) => void;
  onBack: () => void;
};

export function GameOptions({
  mode,
  countTarget,
  timeLimitMs,
  showTimer,
  mirrorX,
  mirrorY,
  letterSystem,
  onModeChange,
  onCountTargetChange,
  onTimeLimitChange,
  onShowTimerChange,
  onMirrorXChange,
  onMirrorYChange,
  onLetterSystemChange,
  onBack,
}: Props) {
  const { t } = useTranslation();

  const formatTimeLimit = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return t('options.timeLimit.seconds', { count: seconds });

    return t('options.timeLimit.minute', { count: seconds / 60 });
  };

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
      label: t('options.questionsCount', { count }),
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
    <Layout
      header={<AppHeader />}
      footer={
        <Button
          className="w-60 max-w-full"
          size="lg"
          variant="outline"
          onClick={onBack}
        >
          {t('common.back')}
        </Button>
      }
    >
      <div className="max-w-md space-y-6 text-slate-700">
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {t('options.title')}
        </h2>

        <div className="flex items-center gap-3">
          <Switch
            id="show-timer"
            checked={showTimer}
            onCheckedChange={onShowTimerChange}
          />
          <Label htmlFor="show-timer" className="text-sm font-normal">
            {t('options.showTimer')}
          </Label>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-slate-900">
            {t('options.gameMode')}
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

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-slate-900">
            {t('options.letters')}
          </legend>

          <RadioGroup
            value={letterSystem}
            onValueChange={(value) =>
              onLetterSystemChange(value as LetterSystem)
            }
            className="gap-3"
          >
            {LETTER_SYSTEMS_LIST.map((system) => (
              <div key={system} className="flex items-center gap-3">
                <RadioGroupItem id={`letters-${system}`} value={system} />
                <Label
                  htmlFor={`letters-${system}`}
                  className="text-sm font-normal"
                >
                  {t(`options.letterSystem.${system}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-slate-900">
            {t('options.mirror')}
          </legend>

          <div className="flex items-center gap-3">
            <Switch
              id="mirror-x"
              checked={mirrorX}
              onCheckedChange={onMirrorXChange}
            />
            <Label htmlFor="mirror-x" className="text-sm font-normal">
              {t('options.mirrorX')}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="mirror-y"
              checked={mirrorY}
              onCheckedChange={onMirrorYChange}
            />
            <Label htmlFor="mirror-y" className="text-sm font-normal">
              {t('options.mirrorY')}
            </Label>
          </div>
        </fieldset>
      </div>
    </Layout>
  );
}
