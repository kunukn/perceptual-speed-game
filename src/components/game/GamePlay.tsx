import { Navigate } from 'react-router';
import { Layout } from '@/components/layout/Layout';
import { useGameOptions } from '@/store/gameOptions';
import { useGameMachine } from './GameMachineContext';
import { GameTimer } from './GameTimer';
import { PuzzleBoard } from './PuzzleBoard';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function GamePlay() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, send } = useGameMachine();
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);
  const showTimer = useGameOptions((s) => s.showTimer);
  const mirrorX = useGameOptions((s) => s.mirrorX);
  const mirrorY = useGameOptions((s) => s.mirrorY);

  if (!state.matches('playing')) return <Navigate to="/" replace />;

  const { rounds, current, startedAt } = state.context;
  const round = rounds[current];

  if (!round) return <Navigate to="/" replace />;

  const handleAbort = () => {
    send({ type: 'ABORT' });
    navigate('/');
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
              <GameTimer startedAt={startedAt} />
            </>
          )}
        </span>
      }
      footer={
        <Button
          size="lg"
          className="min-w-60"
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
