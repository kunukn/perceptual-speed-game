import { Navigate } from 'react-router';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';
import { useGameOptions } from '@/store/gameOptions';
import { formatElapsed } from './gameMachine';
import { useGameMachine } from './GameMachineContext';
import { useConfetti } from './useConfetti';

export function GameResults() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, send } = useGameMachine();
  const mode = useGameOptions((s) => s.mode);
  const countTarget = useGameOptions((s) => s.countTarget);

  const isFinished = state.matches('finished');
  const { correct, answers, elapsedMs } = state.context;
  const answered = answers.length;
  const total = mode === 'time' ? answered : countTarget;
  const canvasRef = useConfetti(
    isFinished && mode === 'count' && correct === total,
  );

  if (!isFinished) return <Navigate to="/" replace />;

  const handleRestart = () => {
    send({ type: 'RESTART' });
    navigate('/');
  };

  return (
    <Layout
      header={<AppHeader />}
      overlay={
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      }
      footer={
        <div className="flex w-full justify-center gap-2 overflow-x-auto">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/review')}
          >
            {t('results.review')}
          </Button>
          <Button size="lg" className="flex-1" onClick={handleRestart}>
            {t('results.restart')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/leaderboard')}
          >
            {t('leaderboard.open')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-center text-slate-800">
        <h2 className="text-xl font-semibold">{t('results.title')}</h2>
        <p className="text-3xl font-bold">
          {correct} / {total}
        </p>
        <p className="text-slate-500">
          {t('results.time', { elapsed: formatElapsed(elapsedMs) })}
        </p>
      </div>
    </Layout>
  );
}
