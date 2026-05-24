import { paths } from '@/app/paths';
import { Layout } from '@/components/layout/Layout';
import { PuzzleBoard } from '@/features/game/components/PuzzleBoard';
import { Timer } from '@/features/game/components/Timer';
import { useGameMachine } from '@/features/game/machine-context';
import { useGameOptions } from '@/features/game/store/options';
import { Navigate } from 'react-router';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function Play() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, send } = useGameMachine();
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);
  const showTimer = useGameOptions((s) => s.showTimer);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);

  /* Warm the Results route chunk (and its canvas-confetti dependency) in the
   * background so the Play → Results transition isn't blocked on a ~1s
   * network fetch on slower connections. */
  useEffect(() => {
    void import('@/features/game/pages/Results');
  }, []);

  if (state.matches('finished')) return <Navigate to={paths.results} replace />;

  if (!state.matches('playing')) return <Navigate to={paths.home} replace />;

  const { rounds, current, startedAt } = state.context;
  const round = rounds[current];

  if (!round) return <Navigate to={paths.home} replace />;

  const handleAbort = () => {
    send({ type: 'ABORT' });
    navigate(paths.home);
  };

  return (
    <Layout
      header={
        <span className="flex items-center justify-center gap-2 text-slate-500 tabular-nums">
          <span>
            {mode === 'time'
              ? t('game.roundLabel', { current: pad2(current + 1) })
              : t('game.roundLabelOfTotal', {
                  current: pad2(current + 1),
                  total: pad2(countTarget),
                })}
          </span>
          {showTimer && (
            <>
              <span aria-hidden>·</span>
              <Timer startedAt={startedAt} />
            </>
          )}
        </span>
      }
      footer={
        <Button
          size="lg"
          className="min-w-40"
          variant="destructive"
          onClick={handleAbort}
        >
          {t('game.abort')}
        </Button>
      }
    >
      <PuzzleBoard
        top={round.top}
        bottom={round.bottom}
        matches={round.matches}
        mirrorX={mirrorX}
        mirrorY={mirrorY}
        onAnswer={(value) => send({ type: 'ANSWER', value })}
      />
    </Layout>
  );
}
