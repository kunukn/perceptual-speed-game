import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { useGameOptions } from '@/store/gameOptions';
import { useGameMachine } from './GameMachineContext';
import { COLS } from './gameMachine';
import { PuzzleBoard } from './PuzzleBoard';

export function GameIntro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { send } = useGameMachine();
  /* Selector form — Intro re-renders only when these fields change, not on every store update. */
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);
  const timeLimitMs = useGameOptions((s) => s.timeLimitMs);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);

  const handleStart = () => {
    send({ type: 'START', options: useGameOptions.getState() });
    navigate('/play');
  };

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
          mirrorX={mirrorX}
          mirrorY={mirrorY}
          highlightIdx={3}
          caption={t('intro.exampleCaption')}
        />

        <div className="mx-auto flex max-w-68 flex-col gap-2 pt-4">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              variant="outline"
              onClick={() => navigate('/options')}
            >
              {t('common.options')}
            </Button>
            <Button className="flex-1" size="lg" onClick={handleStart}>
              {t('intro.start')}
            </Button>
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/leaderboard')}
          >
            {t('leaderboard.open')}
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
