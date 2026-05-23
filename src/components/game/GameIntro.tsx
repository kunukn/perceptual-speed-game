import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { COLS } from './Game';
import { type GameMode } from './gameMachine';
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
  const { t } = useTranslation();

  const formatTimeLimit = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return t('options.timeLimit.seconds', { count: seconds });

    return t('options.timeLimit.minute', { count: seconds / 60 });
  };

  return (
    <Layout header={<AppHeader />}>
      <div className="max-w-md space-y-4 text-slate-700 md:space-y-4">
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {t('intro.howToPlay')}
        </h2>
        <p className="text-sm md:text-center md:text-base">
          {t('intro.rules', { cols: COLS })}
        </p>

        <PuzzleBoard
          label={t('intro.example')}
          top={['a', 'b', 'c', 'd']}
          bottom={['A', 'B', 'C', 'E']}
          showMatches
          showColumnOutlines
          highlightIdx={3}
          caption={t('intro.exampleCaption')}
        />

        <div className="mx-auto flex max-w-68 gap-2">
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            onClick={onOpenOptions}
          >
            {t('common.options')}
          </Button>
          <Button className="flex-1" size="lg" onClick={onStart}>
            {t('intro.start')}
          </Button>
        </div>
        <p className="text-sm text-slate-500 tabular-nums md:text-base">
          {mode === 'time'
            ? t('intro.summaryTime', { time: formatTimeLimit(timeLimitMs) })
            : t('intro.summaryCount', { count: countTarget })}
        </p>
      </div>
    </Layout>
  );
}
