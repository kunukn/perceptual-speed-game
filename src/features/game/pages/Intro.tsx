import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { PuzzleBoard } from '@/features/game/components/PuzzleBoard';
import { COLS, getExamplePuzzle } from '@/features/game/machine';
import { useGameMachine } from '@/features/game/machine-context';
import { useGameOptions } from '@/features/game/store/options';

export function Intro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { send } = useGameMachine();
  /* Selector form — Intro re-renders only when these fields change, not on every store update. */
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);
  const timeLimitMs = useGameOptions((s) => s.timeLimitMs);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);
  const letterSystem = useGameOptions((s) => s.letterSystem);

  /* Stable reference — only recompute when the letter system changes */
  const examplePuzzle = useMemo(
    () => getExamplePuzzle(letterSystem),
    [letterSystem],
  );

  const handleStart = () => {
    send({ type: 'START', options: useGameOptions.getState() });
    navigate(paths.play);
  };

  const formatTimeLimit = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds < 60) return t('options.timeLimit.seconds', { count: seconds });

    return t('options.timeLimit.minute', { count: seconds / 60 });
  };

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <div className="flex w-full max-w-md justify-center gap-2 overflow-x-auto">
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            onClick={() => navigate(paths.options)}
          >
            {t('common.options')}
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            onClick={() => navigate(paths.records)}
          >
            {t('records.open')}
          </Button>
          <Button className="flex-1" size="lg" onClick={handleStart}>
            {t('intro.start')}
          </Button>
        </div>
      }
    >
      <div className="max-w-md space-y-4 text-slate-700">
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {t('intro.howToPlay')}
        </h2>
        <p className="text-sm md:text-center md:text-base">
          {t('intro.rules', { cols: COLS })}
        </p>

        <PuzzleBoard
          label={t('intro.example')}
          top={examplePuzzle.top}
          bottom={examplePuzzle.bottom}
          matches={examplePuzzle.matches}
          showMatches
          showColumnOutlines
          mirrorX={mirrorX}
          mirrorY={mirrorY}
          highlightIdx={3}
          caption={t('intro.exampleCaption')}
        />

        <p className="text-sm text-slate-500 tabular-nums md:text-base">
          {mode === 'time'
            ? t('intro.summaryTime', { time: formatTimeLimit(timeLimitMs) })
            : t('intro.summaryCount', { count: countTarget })}
        </p>
      </div>
    </Layout>
  );
}
